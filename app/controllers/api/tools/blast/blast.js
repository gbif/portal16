'use strict';
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    scientificName = require('../../species/scientificName.ctrl'),
    request = rootRequire('app/helpers/request'),
    bluebird = require('bluebird'),
    _ = require('lodash');

const sourceTaxonomies = {
    'its': '61a5f178-b5fb-4484-b6d8-9b129739e59d',
    'coi': '4cec8fef-f129-4966-89b7-4f8439aba058',
    '16s': 'a97f36e5-ded1-49cc-bdec-ac6170fc7b9c',
    'backbone': 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'
};

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
            let decorated = await decorateWithGBIFspecies2(response.body, seq.marker);
            if (verbose && response.body.alternatives) {
                await decorateAlternatives(response.body.alternatives, seq.marker);
            }
            return decorated;
        } catch (err) {
            return response.body;
        }
    } else {
        return response.body;
    }
}
/*
async function decorateWithGBIFspecies(e) {
    let url = apiConfig.taxon.url + 'match2?name=' + e.name;
    let nub = await request({method: 'GET', url: url, json: true});
    let nubMatch = nub.body;
    console.log(JSON.stringify(nubMatch, null, 2));
    if (['UNRANKED', 'SPECIES'].includes(_.get(nubMatch, 'usage.rank'))) {
        const species = nubMatch.classification.find((t) => t.rank === 'SPECIES');
        if (_.get(species, 'name') === e.name || _.get(nubMatch, 'usage.name') === e.name) {
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
*/

function getSourceTaxonomyDatasetKey(marker) {
    let datasetKey = sourceTaxonomies['backbone']; // default
    if (marker && marker.toLowerCase().startsWith('its')) {
        datasetKey = sourceTaxonomies['its'];
    } else if (marker && (marker.toLowerCase().startsWith('co1') || marker.toLowerCase().startsWith('coi'))) {
        datasetKey = sourceTaxonomies['coi'];
    } else if (marker && marker.toLowerCase().startsWith('16s')) {
        datasetKey = sourceTaxonomies['16s'];
    }
    return datasetKey;
}

function getClassification(taxon) {
    return ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species']
        .filter((key) => !!taxon[key])
        .map((tx) => ({name: (tx === 'species' && taxon.rank === 'SPECIES' && taxon.scientificName !== taxon.species) ? taxon.scientificName : taxon[tx], key: taxon[tx + 'Key']}));
}

function getFormattedGTDBname(taxon) {
    /* Spaces are not allowed in fasta files, therefore these are replaced with _. 
    GTDB, however, may have names like Synechococcus_E sp000153805 
    - therefore we try to detect and adjust for that in order to get species matches from the checklist 
    */
    const splitted = _.get(taxon, 'name', '').split(' ');
    if (splitted.length === 3 && splitted[1].length === 1) {
        return `${splitted[0]}_${splitted[1]} ${splitted[2]}`;
    } else {
        return _.get(taxon, 'name', ''); 
    }
}

async function decorateWithGBIFspecies2(e, marker) {
    const datasetKey = getSourceTaxonomyDatasetKey(marker);
    const name = datasetKey === sourceTaxonomies['16s'] ? getFormattedGTDBname(e) : e.name;
    let url = apiConfig.taxon.url + 'search?q=' + name + '&datasetKey=' + datasetKey;
    let res = await request({method: 'GET', url: url, json: true});
    let match = _.get(res, 'body.results[0]');
    if (['UNRANKED', 'SPECIES'].includes(_.get(match, 'rank'))) {
        if (_.get(match, 'scientificName') === name ) {
            let formatted = datasetKey === sourceTaxonomies['16s'] ? _.get(match, 'scientificName') : await scientificName.getParsedName(
                match.key
            );
            match.formattedName = formatted;
            e.nubMatch = {
                usage: {
                    name: _.get(match, 'scientificName'),
                    formattedName: formatted || _.get(match, 'scientificName'),
                    key: _.get(match, 'key'),
                    nubKey: _.get(match, 'nubKey', ''),
                    rank: _.get(match, 'rank'),
                    datasetKey: datasetKey
                },
                classification: getClassification(match)
            };
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
        const promises = await bluebird.map(alternatives, decorateWithGBIFspecies2, {concurrency: 25});
        await Promise.allSettled(promises);
        return alternatives;
    }
}

module.exports = {
    blast: blast,
    decorateWithGBIFspecies: decorateWithGBIFspecies2
};
