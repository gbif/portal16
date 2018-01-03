"use strict";

let i18n = rootRequire("config/i18n"),
    _ = require('lodash'),
    request = require('requestretry');

module.exports = expandFacets;

/**
 * iteratue all facets types and facets and expand enums with their translation and keys with their scientificName/title etc.
 * @param facets a list of facets from an occurrence search
 */
async function expandFacets(facets, __){
    __ = __ || i18n.__;
    let facetPromises = facets.map(function(facet){return expandFacet(facet, __)});
    let f = await Promise.all(facetPromises);
    return f;
}

async function expandFacet(facet, __){
    //if enum then look up value
    //else get item from API
    if (!_.has(options[facet.field], 'type')) {
        //throw 'No such facet type configured';
        //default to raw
        options[facet.field] = {type: type.RAW};
    }

    if (options[facet.field].type == type.RAW) {
        facet.counts.forEach(function(f){
            f.displayName = f.name;
        });
        return facet;
    } else if (options[facet.field].type == type.ENUM) {
        facet.counts.forEach(function(f){
            let translationPath = options[facet.field].translationPath.replace('{VALUE}', f.name);
            f.displayName = __(translationPath);
        });
        return facet;
    } else if (options[facet.field].type == type.KEY) {
        let facetPromises = facet.counts.map(function(item){return addResolveUrl(item, options[facet.field])});
        let resolvedFacets = await Promise.all(facetPromises);
        return facet;
    }
}

async function addResolveUrl(item, conf) {
    let url = conf.url.replace('{VALUE}', item.name);
    let options = {
        url: url,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw 'failed to get key';
    }
    item.displayName = _.get(response, 'body.' + conf.field, 'Unknown');
    return item;
}

let type = {
    ENUM: 1,
    KEY: 2,
    RAW: 3
};
let options = {
    BASIS_OF_RECORD: {
        type: type.ENUM,
        translationPath: 'basisOfRecord.{VALUE}'
    },
    ISSUE: {
        type: type.ENUM,
        translationPath: 'occurrenceIssue.{VALUE}'
    },
    COUNTRY: {
        type: type.ENUM,
        translationPath: 'country.{VALUE}'
    },
    TAXON_KEY: {
        type: type.KEY,
        url: 'http://api.gbif.org/v1/species/{VALUE}',
        field: 'scientificName'
    },
    KINGDOM_KEY: {
        type: type.KEY,
        url: 'http://api.gbif.org/v1/species/{VALUE}',
        field: 'scientificName'
    }
};
//All other rank keys are the same as taxonKey
let ranks = ['KINGDOM_KEY', 'PHYLUM_KEY', 'CLASS_KEY', 'ORDER_KEY', 'FAMILY_KEY', 'GENUS_KEY', 'SPECIES_KEY'];
ranks.forEach(function(rank){
    options[rank] = options.TAXON_KEY;
});