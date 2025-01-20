'use strict';
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    scientificName = require('../../species/scientificName.ctrl'),
    request = rootRequire('app/helpers/request'),
    bluebird = require('bluebird'),
    _ = require('lodash');
const markerToDB = {
    'COI': 'bold_COI5P_99_consensus_2024_07_19.udb',
    'ITS': 'sh_general_release_dynamic_s_all_25.07.2023.udb',
    '16S': 'gtdb_ssu_reps_r214.udb',
    '18S': 'pr2_version_5.0.0_merged.udb',
    '12S': 'mitofish.12S.Dec2023.udb'
};

async function blast(seq, verbose = false) {
    //let url = apiConfig.blast.url + `/blast${verbose ? '?verbose=true' : ''}`;
    const body = seq;
    if (seq.marker && markerToDB[seq.marker]) {
        body.database = markerToDB[seq.marker];
    };
    let url = apiConfig.blast.url + `/search?includeAlignment=true${verbose ? '&verbose=true' : ''}`;
    let response = await request({
        method: 'POST',
        url: url,
        body: body,
        json: true
    });
    if (response.body.matchType && response.body.name) {
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

async function blastBatch(seq, verbose = false) {
  //  let url = apiConfig.blast.url + `/blast/batch${verbose ? '?verbose=true' : ''}`;
  const body = seq;
  if (seq.marker && markerToDB[seq.marker]) {
    body.database = markerToDB[seq.marker];
  }
  try {
   let url = apiConfig.blast.url + `/search?includeAlignment=true${verbose ? '&verbose=true' : ''}`;
    let response = await request({
        method: 'POST',
        url: url,
        body: body,
        json: true
    });
   
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
}

async function decorateWithGBIFspecies(e) {
    let url = apiConfig.taxon.url + 'match2?name=' + e.name;
    let nub = await request({method: 'GET', url: url, json: true});
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

async function getDatabasesAvailable() {
    try {
        let url = apiConfig.blast.url + `/databases-available`;
    let response = await request({method: 'GET', url: url, json: true});
        return response.body;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    blast: blast,
    blastBatch: blastBatch,
    decorateWithGBIFspecies: decorateWithGBIFspecies,
    getDatabasesAvailable: getDatabasesAvailable
};
