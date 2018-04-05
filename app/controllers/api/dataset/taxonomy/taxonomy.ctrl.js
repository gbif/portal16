'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    log = rootRequire('config/log'),
    helper = rootRequire('app/models/util/util'),
    utils = rootRequire('app/helpers/utils'),
    ranks = rootRequire('app/helpers/constants').linneanRanks,
    Taxon = rootRequire('app/models/gbifdata/gbifdata').Taxon,
    apiConfig = rootRequire('app/models/gbifdata/apiConfig');

module.exports = function(app) {
    app.use('/api', router);
};

// TODO: pass into API
let limit = 250;

router.get('/taxonomy/:datasetKey', getRoot);
router.get('/taxonomy/:datasetKey/:taxonKey', getTaxon);
router.get('/taxonomy/:datasetKey/:taxonKey/parents', getParents);
router.get('/taxonomy/:datasetKey/:taxonKey/children', getChildren);
router.get('/taxonomy/:datasetKey/:taxonKey/synonyms', getSynonyms);

function isOccurrence(req) {
    return req.query.occ == 'true';
}

function getRoot(req, res, next) {
    if (isOccurrence(req)) {
        // use occ solr facets
        // as every occ record with a taxonKey must also have a kingdom, the kingdoms and other higher taxa should always come first in facets as they are most frequent
        return callApi(res, next, buildSolrQuery(req, null, limit), convertFacetsAcceptedOnly);
    } else {
        callApi(res, next, apiConfig.taxonRoot.url + req.params.datasetKey, prunePage);
    }
}

function getTaxon(req, res, next) {
    callApi(res, next, apiConfig.taxon.url + req.params.taxonKey);
}

function getParents(req, res, next) {
    callApi(res, next, apiConfig.taxon.url + req.params.taxonKey + '/parents', pruneTaxa);
}

function getChildren(req, res, next) {
    let childrenLimit = req.query.limit || limit;
    let offset = req.query.offset || 0;
    if (isOccurrence(req)) {
        Taxon.get(req.params.taxonKey).then(function(tax) {
            // use occ solr facets
            callApi(res, next, buildSolrQuery(req, tax.record.rank, childrenLimit, offset), convertFacetsAcceptedOnly, tax.record.key);
        });
    } else {
        callApi(res, next, apiConfig.taxon.url + req.params.taxonKey + '/children?limit=' + childrenLimit + '&offset=' + offset, prunePage);
    }
}

function getSynonyms(req, res, next) {
    if (isOccurrence(req)) {
        Taxon.get(req.params.taxonKey).then(function(tax) {
            // use occ solr facets
            callApi(res, next, buildSolrQuery(req, tax.record.rank, limit), convertFacetsSynonymsOnly, tax.record.key);
        });
    } else {
        callApi(res, next, apiConfig.taxon.url + req.params.taxonKey + '/synonyms?limit=' + limit, prunePage);
    }
}

function nextLowerRank(rank) {
    if (rank) {
        let idx = _.indexOf(ranks, rank);
        if (idx >= 0) {
            return rank == 'species' ? 'taxon' : ranks[idx + 1];
        }
        return '';
    }
    return 'kingdom';
}

function buildSolrQuery(req, rank, limit, offset) {
    offset = offset || 0;
    if (rank) {
        rank = rank.toLowerCase();
    }
    let url = apiConfig.occurrenceSearch.url + '?limit=0&facetOffset=' + offset + '&facetLimit=' + limit + '&datasetKey=' + req.params.datasetKey + '&facet=' + nextLowerRank(rank) + 'Key';
    if (req.params.taxonKey && rank) {
        url = url + '&' + rank + 'Key=' + req.params.taxonKey;
    }
    return url;
}

function callApi(res, next, path, transform, taxonKey) {
    helper.getApiData(path, function(err, data) {
        if (data && typeof data.errorType !== 'undefined') {
            log.error(data.errorType);
            let statusCode = (data.errorResponse && data.errorResponse.statusCode) ? data.errorResponse.statusCode : 500
            res.sendStatus(statusCode);
        } else if (err) {
            log.error(err.message);
            res.sendStatus(err.statusCode || 500);
        } else if (data) {
            if (transform) {
                transform(data, taxonKey).then(function(resolvedData) {
                    res.json(resolvedData);
                }).catch(function(err) {
                    log.error(err.message);
                    res.sendStatus(err.statusCode || 500);
                });
            } else {
                res.json(data);
            }
        } else {
            log.error('Missing data and no error object was given');
            res.sendStatus(500);
        }
    }, {retries: 2, timeoutMilliSeconds: 10000});
}

function convertFacetsAcceptedOnly(page, parentKey) {
    return convertFacets(page, function(rec) {
        return rec.record.parentKey == parentKey;
    });
}

function convertFacetsSynonymsOnly(page, acceptedKey) {
    return convertFacets(page, function(rec) {
        return rec.record.acceptedKey == acceptedKey;
    });
}

function convertFacets(page, filterFunc) {
    let promises = [];
    page.numOccurrences = page.count;
    page.count = page.facets.length;
    page.endOfRecords = true;
    _.each(page.facets[0].counts, function(fc) {
        let key = Number(fc.name);
        promises.push(Taxon.get(key).then(function(t) {
            t.record.numOccurrences = fc.count;
            return t;
        }).catch(function(err) {
            log.warn(err.message);
        }));
    });
    delete page.facets;
    // finally return combined promise
    return Promise.all(promises).then(function(ps) {
            page.results = _pruneTaxa(
                utils.sortByRankThenAlpha(
                    _.map(
                        _.filter(ps, filterFunc)
                        , function(rec) {
                            return rec.record;
                        })
                )
            );
            return page;
        });
}

function prunePage(page, idsToIgnore) {
    page.results = _pruneTaxa(page.results, idsToIgnore);
    return Promise.resolve(page);
}

function pruneTaxa(taxa, idsToIgnore) {
    return Promise.resolve(_pruneTaxa(taxa, idsToIgnore));
}

function _pruneTaxa(taxa, idsToIgnore) {
    idsToIgnore = idsToIgnore || [];

    // //TODO add parsed names
    // taxa.forEach(function(e){
    //    if (e.nameType === 'SCIENTIFIC') {
    //        e._parsed = {
    //            first: e.scientificName + ' hej',
    //            second: 'med dig'
    //        };
    //    }
    // });

    let pruned = _.map(
        _.remove(taxa, function(t) {
            return _.indexOf(idsToIgnore, t.key) < 0;
        })
        , function(tax) {
            return _.pick(
                tax, ['key', '_parsed', 'nameType', 'nameKey', 'acceptedKey', 'canonicalName', 'authorship', 'scientificName', 'rank', 'taxonomicStatus', 'numDescendants', 'numOccurrences']
            );
        });
    return pruned;
}

