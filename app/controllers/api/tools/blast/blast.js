'use strict';
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    scientificName = require('../../species/scientificName.ctrl'),
    request = rootRequire('app/helpers/request');

async function blast(seq) {
    let url = apiConfig.blast.url + '/blast';
    let response = await request({
        method: 'POST',
        url: url,
        body: seq,
        json: true
    });
    if (response.body.matchType) {
        try {
            let decorated = await decorateWithGBIFspecies(response.body);
            return decorated;
        } catch (err) {
            return response.body;
        }
    } else {
        return response.body;
    }
}

async function decorateWithGBIFspecies(e) {
    let url = apiConfig.taxon.url + 'match2?name=' + e.name;
    let nub = await request({method: 'GET', url: url, json: true});
    e.nubMatch = nub.body;
    if (e.nubMatch && e.nubMatch.usage) {
        let formatted = await scientificName.getParsedName(
            e.nubMatch.usage.key
        );
        e.nubMatch.usage.formattedName = formatted;
        return e;
    } else {
        return e;
    }
}

module.exports = {
    blast: blast,
    decorateWithGBIFspecies: decorateWithGBIFspecies
};
