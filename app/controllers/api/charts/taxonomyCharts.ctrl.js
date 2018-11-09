'use strict';
let express = require('express'),
    router = express.Router(),
    log = rootRequire('config/log'),
    _ = require('lodash'),
    request = rootRequire('app/helpers/request'),
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    q = require('q'),
    clientCancelledRequest = 'clientCancelledRequest';


module.exports = function(app) {
    app.use('/api/chart', router);
};

router.get('/checklist/:key/taxonomy', function(req, res) {
    let datasetKey = req.params.key;
    return getChecklistTaxonomy(datasetKey).then(function(taxa) {
        return res.json(taxa);
    }).catch(function(err) {
        log.warn({module: 'api/chart/checklist/:key/taxonomy', key: datasetKey}, err);
        res.sendStatus(500);
    });
});

router.get('/occurrence/sunburst', function(req, res) {
    let query = req.query || {};
    return getOccurrenceDatasetTaxonomy(query, req).then(function(taxa) {
        return res.json(taxa);
    }).catch(function() {
        res.status(500);
        res.send();
    });
});


function hasNoImmediateParentButHasGrandparent(tx, rankKeys) {
    return !tx.hasOwnProperty(rankKeys[rankKeys.indexOf(tx.rank.toLowerCase() + 'Key') - 1]) && tx.hasOwnProperty(rankKeys[rankKeys.indexOf(tx.rank.toLowerCase() + 'Key') - 2]);
}
function getGrandParentKey(tx, rankKeys) {
    return tx[rankKeys[rankKeys.indexOf(tx.rank.toLowerCase() + 'Key') - 2]];
}


async function getOccurrenceDatasetTaxonomy(query, req) {
    let cancelRequest = false;
    req.on('close', function() {
        cancelRequest = true;
    });
    let rankKeys = ['kingdomKey', 'phylumKey', 'classKey', 'orderKey', 'familyKey', 'genusKey'];
    let taxon = await expandWithTaxon({name: query.taxon_key});


    if (query.taxon_key && typeof query.taxon_key === 'string') {
        rankKeys.splice(0, rankKeys.indexOf(taxon.rank.toLowerCase() + 'Key'));
    }
    rankKeys.splice(4, rankKeys.length - 4);

    let options = _.merge({}, query, {facet: rankKeys, facetLimit: 1000, limit: 0});
    let baseRequest = {
        url: apiConfig.occurrenceSearch.url + '?' + querystring.stringify(options),
        method: 'GET',
        json: true,
        fullResponse: true
    };
    let response = await request(baseRequest);
    if (response.statusCode > 299) {
        throw response;
    }
    let taxonFacets = response.body.facets;
    let dummyTaxa = {};
    let levelCounts = {1: 0, 2: 0, 3: 0, 4: 0};
    let mapFn = function(taxon) {
        if (cancelRequest) {
            throw {type: clientCancelledRequest};
        }
        taxon.name = taxon.canonicalName;
        taxon.id = (rankKeys.indexOf(taxon.rank.toLowerCase() + 'Key')) + '.' + taxon.key;
        let taxonRankIndex = rankKeys.indexOf(taxon.rank.toLowerCase() + 'Key');
        levelCounts[taxonRankIndex + 1] ++;
        if (taxonRankIndex > 0) { // there should be a parentrank
            let parentTaxonKey = rankKeys[taxonRankIndex - 1];
            let grandParentTaxonKey = (taxonRankIndex > 1) ? rankKeys[taxonRankIndex - 2] : undefined;

            if (taxon[parentTaxonKey]) {
                taxon.parent = (taxonRankIndex - 1) + '.' + taxon[parentTaxonKey];
            } else if (grandParentTaxonKey && taxon[grandParentTaxonKey]) { // there might be a grandparent
                if (!dummyTaxa[taxon[grandParentTaxonKey]]) {
                    let rankName = parentTaxonKey.split('Key')[0].toLowerCase();
                    dummyTaxa[taxon[grandParentTaxonKey]] = {
                        id: (taxonRankIndex - 1) + '.unknown' + taxon[grandParentTaxonKey],
                        name: 'Unknown ' + rankName,
                        parent: (taxonRankIndex - 2) + '.' + taxon[grandParentTaxonKey],
                        value: 0
                    };
                }
                taxon.parent = (taxonRankIndex - 1) + '.unknown' + taxon[grandParentTaxonKey];
            }
        }
    };
    let promises = [];
    _.each(taxonFacets, function(facet) {
        promises = promises.concat(_.map(facet.counts, function(c) {
            return expandWithTaxon(c, mapFn).then(function(result) {
                if (hasNoImmediateParentButHasGrandparent(result, rankKeys)) {
                    if (dummyTaxa[getGrandParentKey(result, rankKeys)]) {
                        dummyTaxa[getGrandParentKey(result, rankKeys)].value += c.count;
                    }
                }

                result.value = c.count;
                return _.pick(result, 'id', 'parent', 'value', 'name', 'rank');
            })
                .catch(function(err) {

                });
        }));
    });

    let taxa = await q.all(promises);

    _.forEach(dummyTaxa, function(val) {
        taxa.push(val);
    });

    return {levelCounts: levelCounts, count: response.body.count, results: taxa};
}

async function getChecklistTaxonomy(key) {
    let baseRequest = {
        url: apiConfig.taxonSearch.url + '?' + querystring.stringify({
            datasetKey: key,
            facet: 'higherTaxonKey',
            rank: 'SPECIES',
            status: 'ACCEPTED',
            facetLimit: 1000,
            limit: 0
        }),
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
    let result = {KINGDOM: [], PHYLUM: [], CLASS: [], ORDER: [], FAMILY: [], GENUS: [], count: response.body.count};

    for (let i = 0; i < taxa.length; i++) {
        if (taxa[i].parentKey && parentMapUnranked[taxa[i].parentKey]) {
            parentMapUnranked[taxa[i].parentKey].push(taxa[i]);
        } else if (taxa[i].parentKey) {
            parentMapUnranked[taxa[i].parentKey] = [taxa[i]];
        }

        switch (taxa[i].rank) {
            case 'GENUS':
                if (taxa[i].familyKey && parentMap[taxa[i].familyKey]) {
                    parentMap[taxa[i].familyKey].push(taxa[i]);
                } else if (taxa[i].familyKey) {
                    parentMap[taxa[i].familyKey] = [taxa[i]];
                }

                result.GENUS.push(taxa[i]);
                break;
            case 'FAMILY':
                if (taxa[i].orderKey && parentMap[taxa[i].orderKey]) {
                    parentMap[taxa[i].orderKey].push(taxa[i]);
                } else if (taxa[i].orderKey) {
                    parentMap[taxa[i].orderKey] = [taxa[i]];
                }
                result.FAMILY.push(taxa[i]);
                break;
            case 'ORDER':
                if (taxa[i].classKey && parentMap[taxa[i].classKey]) {
                    parentMap[taxa[i].classKey].push(taxa[i]);
                } else if (taxa[i].classKey) {
                    parentMap[taxa[i].classKey] = [taxa[i]];
                }
                result.ORDER.push(taxa[i]);
                break;
            case 'CLASS':
                if (taxa[i].phylumKey && parentMap[taxa[i].phylumKey]) {
                    parentMap[taxa[i].phylumKey].push(taxa[i]);
                } else if (taxa[i].phylumKey) {
                    parentMap[taxa[i].phylumKey] = [taxa[i]];
                }
                result.CLASS.push(taxa[i]);
                break;
            case 'PHYLUM':
                if (taxa[i].kingdomKey && parentMap[taxa[i].kingdomKey]) {
                    parentMap[taxa[i].kingdomKey].push(taxa[i]);
                } else if (taxa[i].kingdomKey) {
                    parentMap[taxa[i].kingdomKey] = [taxa[i]];
                }
                result.PHYLUM.push(taxa[i]);
                break;
            case 'KINGDOM':
                result.KINGDOM.push(taxa[i]);
                break;
        }
    }

    for (let i = 0; i < result.KINGDOM.length; i++) {
        if (parentMap[result.KINGDOM[i].key.toString()]) {
            result.KINGDOM[i].children = parentMap[result.KINGDOM[i].key.toString()];
        } else if (parentMapUnranked[result.KINGDOM[i].key.toString()]) {
            result.KINGDOM[i].children = parentMapUnranked[result.KINGDOM[i].key.toString()];
        }
    }
    for (let i = 0; i < result.PHYLUM.length; i++) {
        if (parentMap[result.PHYLUM[i].key.toString()]) {
            result.PHYLUM[i].children = parentMap[result.PHYLUM[i].key.toString()];
        } else if (parentMapUnranked[result.PHYLUM[i].key.toString()]) {
            result.PHYLUM[i].children = parentMapUnranked[result.PHYLUM[i].key.toString()];
        }
    }
    if (result.KINGDOM.length < 2 && result.PHYLUM.length < 2) {
        for (let i = 0; i < result.CLASS.length; i++) {
            if (parentMap[result.CLASS[i].key.toString()]) {
                result.CLASS[i].children = parentMap[result.CLASS[i].key.toString()];
            } else if (parentMapUnranked[result.CLASS[i].key.toString()]) {
                result.CLASS[i].children = parentMapUnranked[result.CLASS[i].key.toString()];
            }
        }
    }

    if (result.KINGDOM.length < 2 && result.PHYLUM.length < 2 && result.CLASS.length < 2) {
        for (let i = 0; i < result.ORDER.length; i++) {
            if (parentMap[result.ORDER[i].key.toString()]) {
                result.ORDER[i].children = parentMap[result.ORDER[i].key.toString()];
            } else if (parentMapUnranked[result.ORDER[i].key.toString()]) {
                result.ORDER[i].children = parentMapUnranked[result.ORDER[i].key.toString()];
            }
        }
    }

    if (result.KINGDOM.length < 2 && result.PHYLUM.length < 2 && result.CLASS.length < 2 && result.ORDER.length < 2) {
        for (let i = 0; i < result.FAMILY.length; i++) {
            if (parentMap[result.FAMILY[i].key.toString()]) {
                result.FAMILY[i].children = parentMap[result.FAMILY[i].key.toString()];
            } else if (parentMapUnranked[result.FAMILY[i].key.toString()]) {
                result.FAMILY[i].children = parentMapUnranked[result.FAMILY[i].key.toString()];
            }
        }
    }


    return result;
}

async function expandWithTaxon(taxonFacet, mapFn) {
    let taxonRequest = {
        url: apiConfig.taxon.url + taxonFacet.name,
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let taxResponse = await request(taxonRequest);
    let taxon = _.pick(taxResponse.body, ['key', 'canonicalName', 'scientificName', 'phylumKey', 'kingdomKey', 'classKey', 'orderKey', 'familyKey', 'genusKey', 'parentKey', 'rank', 'synonym']);
    taxon._count = taxonFacet.count;
    if (mapFn && typeof mapFn === 'function') {
        mapFn(taxon);
    }
    return taxon;
}

