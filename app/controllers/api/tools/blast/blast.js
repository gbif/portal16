'use strict';
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    scientificName = require('../../species/scientificName.ctrl'),
    request = require('request'), //rootRequire('app/helpers/request'),
    requestWithAgent = rootRequire('app/helpers/request'),
    bluebird = require('bluebird'),
    _ = require('lodash');

async function blast(seq, verbose = false) {
    let url = apiConfig.blast.url + `/blast${verbose ? '?verbose=true' : ''}`;
    let response = await request({
        method: 'POST',
        url: url,
        body: seq,
        json: true
    });
    if (response.body.matchType) {
        try {
            let decorated = await decorateWithGBIFspecies(response.body);
            if (verbose && response.body.alternatives) {
                await decorateAlternatives(response.body.alternatives);
            }
            return decorated;
        } catch (err) {
            return response.body;
        }
    } else {
        if (response.statusCode > 299) {
            throw response;
        } else {
            return response.body;
        }
    }
}

async function blastBatch2(seq, verbose = false, signal, cb) {
    let url = apiConfig.blast.url + `/blast/batch${verbose ? '?verbose=true' : ''}`;
    let job = request({
        method: 'POST',
        uri: url,
        body: seq,
        json: true,
        timeout: 180000
    }, async (err, res, body) => {
        if (err) {
            //console.log('BLAST batch job error: ', err);
            throw err;
        } else if (res.statusCode > 299) {
           // console.log('BLAST batch job failed with status code: ', res.statusCode);
            throw res;
        } else {
           try {
        const promises = body.map(async (result) => {
            if (result.matchType) {
                try {
                    let decorated = await decorateWithGBIFspecies(result);
                    if (verbose && result.alternatives) {
                        await decorateAlternatives(result.alternatives);
                    }
                    return decorated;
                } catch (err) {
                    return result;
                }
            } else {
                    return result; 
            }
        });
       const data = await Promise.all(promises);
       cb(null, data);
    } catch (error) {
        console.log(error);
        cb(body);
    }
    }
});
 
  
 if (signal ) {
        signal.addEventListener('abort', () => {
            //console.log(`Job aborted`);
            job.abort();
        });
    }
    return job;
}

/* async function blastBatch(seq, verbose = false, signal) {
    let url = apiConfig.blast.url + `/blast/batch${verbose ? '?verbose=true' : ''}`;
 
    let response = await request({
        method: 'POST',
        url: url,
        body: seq,
        json: true
    });
  
    if (response.statusCode > 299) {
            throw response;
        }
    try {
        const promises = response.body.map(async (result) => {
            if (result.matchType) {
                try {
                    let decorated = await decorateWithGBIFspecies(result);
                    if (verbose && result.alternatives) {
                        await decorateAlternatives(result.alternatives);
                    }
                    return decorated;
                } catch (err) {
                    return result;
                }
            } else {
                    return result; 
            }
        });
       const data = await Promise.all(promises);
       return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
} */

async function decorateWithGBIFspecies(e) {
    let url = apiConfig.taxon.url + 'match2?name=' + e.name;
    let nub = await requestWithAgent({method: 'GET', url: url, json: true});
    let nubMatch = nub.body;
    if (_.get(nubMatch, 'diagnostics.matchType') === 'EXACT') {
        const canonical = nubMatch.classification.find((t) => _.get(nubMatch, 'usage.key') === t.key);
        if (_.get(canonical, 'name') === e.name || _.get(nubMatch, 'usage.name') === e.name) {
            let formatted = await scientificName.getParsedName(
                nubMatch.usage.key
            );
            nubMatch.usage.formattedName = formatted;
            e.nubMatch = nubMatch;
            return e;
        } else {
            return e;
        }
    } else {
        return e;
    }
}

async function decorateAlternatives(alternatives) {
    if (!alternatives || alternatives.length < 1) {
        return;
    } else {
        // Limit to 25 concurrent requests
        const promises = await bluebird.map(alternatives, decorateWithGBIFspecies, {concurrency: 25});
        await Promise.allSettled(promises);
        return alternatives;
    }
}

module.exports = {
    blast: blast,
    blastBatch: blastBatch2,
    decorateWithGBIFspecies: decorateWithGBIFspecies
};
