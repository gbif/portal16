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


/*module.exports = function (app) {
    app.use('/api', router);
}; */

module.exports = function (app) {
    app.use('/api/chart/', router);
};

router.get('/dataset/:key/checklist/taxonomy', function (req, res) {
    var datasetKey = req.params.key;
    return getChecklistTaxonomy(datasetKey).then(function(taxa){
        return res.json(taxa)
    });


});

router.get('/occurrence/sunburst', function (req, res) {
    let query = req.query || {};
    return getOccurrenceDatasetTaxonomy(query).then(function(taxa){
        return res.json(taxa)
    });
});


async function getOccurrenceDatasetTaxonomy(query) {

    let rankKeys = ['kingdomKey' ,'phylumKey' ,'classKey', 'orderKey', 'familyKey', 'genusKey' ];

    // TODO check if taxon_key is an array, maybe default to array and use [taxon_key] if its an integer

    let taxon = await expandWithTaxon({name: query.taxon_key});
    if (query.taxon_key) {
        rankKeys.splice(0 ,  rankKeys.indexOf(taxon.rank.toLowerCase()+"Key") )
    } else {
        rankKeys.splice(4, rankKeys.length -4);
    }

    let rankIndex = _.zipObject(_.map(rankKeys, function(k){
        return k.split('Key')[0].toUpperCase();
    }), _.map(rankKeys, function(k){

            return (query.taxon_key) ? rankKeys.indexOf(k) : rankKeys.indexOf(k) + 1
    }));


    let options = _.merge({}, query, {facet: rankKeys,  facetLimit : 1000, limit: 0 });

   /* if(taxon_key){
        options.taxon_key = taxon_key;
    }; */

    let baseRequest = {
        url: apiConfig.occurrenceSearch.url +  '?' + querystring.stringify(options),
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let response = await request(baseRequest);
    if (response.statusCode > 299) {
        throw response;
    }
    let taxonFacets = response.body.facets;



    let mapFn = function(taxon){


        taxon.name = taxon.canonicalName;

        taxon.id = rankIndex[taxon.rank]+"."+taxon.key;


       switch(taxon.rank) {
           case "SPECIES":
               taxon.parent = rankIndex.GENUS+"."+taxon.genusKey;
               break;
            case "GENUS":
                taxon.parent = rankIndex.FAMILY+"."+taxon.familyKey;
                break;
            case "FAMILY":
                taxon.parent = rankIndex.ORDER+"."+taxon.orderKey;
                break;
            case "ORDER":
                taxon.parent = (rankIndex.CLASS) ? rankIndex.CLASS +"."+taxon.classKey : "";
                break;
            case "CLASS":
                taxon.parent = rankIndex.PHYLUM+"."+taxon.phylumKey;
                break;
            case "PHYLUM":
                taxon.parent = rankIndex.KINGDOM+"."+taxon.kingdomKey;
                break;
            case "KINGDOM":
               // taxon.id = 1+"."+taxon.key;
                taxon.parent = "0.0";
                break;

        }

    }
    let promises = [];
    let kingdomOccCount = 0;
    _.each(taxonFacets, function(facet){
        promises = promises.concat(_.map(facet.counts, function(c){
         return expandWithTaxon(c, mapFn).then(function(result){
                if(result.rank === 'KINGDOM'){
                    kingdomOccCount += c.count;
                }
                result.value = c.count;
              return  _.pick(result, 'id', 'parent', 'value' , 'name', 'rank');
          });
        }));
    })

    let taxa = await q.all(promises);
    if(!query.taxon_key && kingdomOccCount < response.body.count){
        taxa.push({
            name: 'Other Kingdoms',
            parent: '0.0',
            id: "1.abc",
            value: response.body.count - kingdomOccCount
        });
    };
    if(!query.taxon_key){
        // if theres no root taxon add the whole dataset as root
        taxa.push({
            name: 'Entire dataset',
            parent: '',
            id: "0.0",
            value: response.body.count
        });
    } else {
        // add the

    }

    return taxa;
}

async function getChecklistTaxonomy(key) {

    let baseRequest = {
        url: apiConfig.taxonSearch.url +  '?' + querystring.stringify({datasetKey : key, facet: 'higherTaxonKey', rank: 'SPECIES',  facetLimit : 1000, limit: 0 }),
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
    let parentMapUnranked = {};
    let parentMap = {};
    let result = { KINGDOM: [], PHYLUM: [], CLASS: [], ORDER: [], FAMILY: [], GENUS: [], count: response.body.count};

    for(var i=0; i < taxa.length; i++){

        if(taxa[i].parentKey && parentMapUnranked[taxa[i].parentKey]){
            parentMapUnranked[taxa[i].parentKey].push(taxa[i]);
        } else if(taxa[i].parentKey){
            parentMapUnranked[taxa[i].parentKey] = [taxa[i]];
        };


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
        } else if(parentMapUnranked[result.KINGDOM[i].key.toString()]){
            result.KINGDOM[i].children = parentMapUnranked[result.KINGDOM[i].key.toString()];
        }
    }
    for(var i=0; i< result.PHYLUM.length; i++){
        if(parentMap[result.PHYLUM[i].key.toString()]){
            result.PHYLUM[i].children = parentMap[result.PHYLUM[i].key.toString()];
        } else if(parentMapUnranked[result.PHYLUM[i].key.toString()]){
            result.PHYLUM[i].children = parentMapUnranked[result.PHYLUM[i].key.toString()];
        }
    }
    if(result.KINGDOM.length < 2 && result.PHYLUM.length < 2){
        for(var i=0; i< result.CLASS.length; i++){
            if(parentMap[result.CLASS[i].key.toString()]){
                result.CLASS[i].children = parentMap[result.CLASS[i].key.toString()];
            } else if(parentMapUnranked[result.CLASS[i].key.toString()]){
                result.CLASS[i].children = parentMapUnranked[result.CLASS[i].key.toString()];
            }
        }
    }

    if(result.KINGDOM.length < 2 && result.PHYLUM.length < 2 && result.CLASS.length < 2){
        for(var i=0; i< result.ORDER.length; i++){
            if(parentMap[result.ORDER[i].key.toString()]){
                result.ORDER[i].children = parentMap[result.ORDER[i].key.toString()];
            } else if(parentMapUnranked[result.ORDER[i].key.toString()]){
                result.ORDER[i].children = parentMapUnranked[result.ORDER[i].key.toString()];
            }
        }
    }

    if(result.KINGDOM.length < 2 && result.PHYLUM.length < 2 && result.CLASS.length < 2  && result.ORDER.length < 2){
        for(var i=0; i< result.FAMILY.length; i++){
            if(parentMap[result.FAMILY[i].key.toString()]){
                result.FAMILY[i].children = parentMap[result.FAMILY[i].key.toString()];
            } else if(parentMapUnranked[result.FAMILY[i].key.toString()]){
                result.FAMILY[i].children = parentMapUnranked[result.FAMILY[i].key.toString()];
            }
        }
    }


    return result;
}

async function expandWithTaxon(taxonFacet, mapFn){

    let taxonRequest = {
        url: apiConfig.taxon.url +  taxonFacet.name,
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let taxResponse = await request(taxonRequest);
    let taxon = _.pick(taxResponse.body, ['key', 'canonicalName', 'scientificName', 'phylumKey', 'kingdomKey', 'classKey', 'orderKey', 'familyKey', 'genusKey', 'parentKey', 'rank', 'synonym']);
    taxon._count = taxonFacet.count;
    if(mapFn && typeof mapFn === 'function'){
        mapFn(taxon)
    }
    return taxon;
}

