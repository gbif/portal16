"use strict";
var express = require('express'),
    router = express.Router(),
    log = rootRequire('config/log'),
    _ = require('lodash'),
    request = require('requestretry'),
    apiConfig = require('../../../../../models/gbifdata/apiConfig'),
    querystring = require('querystring'),
  //  gbifData = require('../../../../models/gbifdata/gbifdata'),
    q = require('q');


module.exports = function (app) {
    app.use('/api', router);
};

router.get('/dataset/:key/checklist/taxonomy', function (req, res) {
    var datasetKey = req.params.key;
    return getChecklistTaxonomy(datasetKey).then(function(taxa){
        return res.json(taxa)
    });


});

router.get('/dataset/occurrence/taxonomy/:key', function (req, res) {
    var datasetKey = req.params.key;
});


async function getChecklistTaxonomy(key) {

    let baseRequest = {
        url: apiConfig.taxonSearch.url +  '?' + querystring.stringify({datasetKey : key, facet: 'higherTaxonKey', facetLimit : 1000, limit: 0 }),
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let response = await request(baseRequest);
    if (response.statusCode > 299) {
        throw response;
    }
    let taxonFacets = response.body.facets[0].counts;
    let promises = _.map(taxonFacets, expandWithTaxon);
    let taxa = await q.all(promises);

    let parentMap = {};
    let result = { KINGDOM: [], PHYLUM: [], CLASS: [], ORDER: [], FAMILY: [], GENUS: []};

    for(var i=0; i < taxa.length; i++){

        switch(taxa[i].rank) {
            case "GENUS":
                if(taxa[i].familyKey && parentMap[taxa[i].familyKey]){
                    parentMap[taxa[i].familyKey].push(taxa[i])
                } else if(taxa[i].familyKey){
                    parentMap[taxa[i].familyKey] = [taxa[i]]
                };
                result.GENUS.push(taxa[i]);
                break;
            case "FAMILY":
                if(taxa[i].orderKey && parentMap[taxa[i].orderKey]){
                    parentMap[taxa[i].orderKey].push(taxa[i])
                } else if(taxa[i].orderKey){
                    parentMap[taxa[i].orderKey] = [taxa[i]]
                }
                result.FAMILY.push(taxa[i])
                break;
            case "ORDER":
                if(taxa[i].classKey && parentMap[taxa[i].classKey]){
                    parentMap[taxa[i].classKey].push(taxa[i])
                } else if(taxa[i].classKey){
                    parentMap[taxa[i].classKey] = [taxa[i]]
                }
                result.ORDER.push(taxa[i])
                break;
            case "CLASS":
                if(taxa[i].phylumKey && parentMap[taxa[i].phylumKey]){
                    parentMap[taxa[i].phylumKey].push(taxa[i])
                } else if(taxa[i].phylumKey){
                    parentMap[taxa[i].phylumKey] = [taxa[i]]
                }
                result.CLASS.push(taxa[i])
                break;
            case "PHYLUM":
                if(taxa[i].kingdomKey && parentMap[taxa[i].kingdomKey]){
                    parentMap[taxa[i].kingdomKey].push(taxa[i])
                } else if(taxa[i].kingdomKey){
                    parentMap[taxa[i].kingdomKey] = [taxa[i]]
                }
                result.PHYLUM.push(taxa[i]);
                break;
            case "KINGDOM":
                result.KINGDOM.push(taxa[i]);
                break;
        }

    }

    for(var i=0; i< result.KINGDOM.length; i++){
        if(parentMap[result.KINGDOM[i].key.toString()]){
            result.KINGDOM[i].children = parentMap[result.KINGDOM[i].key.toString()];
        }
    }
    for(var i=0; i< result.PHYLUM.length; i++){
        if(parentMap[result.PHYLUM[i].key.toString()]){
            result.PHYLUM[i].children = parentMap[result.PHYLUM[i].key.toString()];
        }
    }
    if(result.KINGDOM.length ===1 && result.PHYLUM.length === 1){
        for(var i=0; i< result.CLASS.length; i++){
            if(parentMap[result.CLASS[i].key.toString()]){
                result.CLASS[i].children = parentMap[result.CLASS[i].key.toString()];
            }
        }
    }

    if(result.KINGDOM.length ===1 && result.PHYLUM.length === 1 && result.CLASS.length === 1){
        for(var i=0; i< result.ORDER.length; i++){
            if(parentMap[result.ORDER[i].key.toString()]){
                result.ORDER[i].children = parentMap[result.ORDER[i].key.toString()];
            }
        }
    }

    if(result.KINGDOM.length ===1 && result.PHYLUM.length === 1 && result.CLASS.length === 1  && result.ORDER.length === 1){
        for(var i=0; i< result.FAMILY.length; i++){
            if(parentMap[result.FAMILY[i].key.toString()]){
                result.FAMILY[i].children = parentMap[result.FAMILY[i].key.toString()];
            }
        }
    }


    return result;
}

async function expandWithTaxon(taxonFacet){

    let taxonRequest = {
        url: apiConfig.taxon.url +  taxonFacet.name,
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let taxResponse = await request(taxonRequest);

    let taxon = _.pick(taxResponse.body, ['key', 'canonicalName', 'phylumKey', 'kingdomKey', 'classKey', 'orderKey', 'familyKey', 'rank', 'synonym']);
    taxon._count = taxonFacet.count;

    return taxon;
}