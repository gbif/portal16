"use strict";
var express = require('express'),
    router = express.Router(),
    Q = require('q'),
    _ = require('lodash'),
    helper = rootRequire('app/models/util/util'),
    keys = rootRequire('app/helpers/constants'),
    utils = rootRequire('app/helpers/utils'),
    Taxon = rootRequire('app/models/gbifdata/gbifdata').Taxon,
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    gbifData = rootRequire('app/models/gbifdata/gbifdata');

const querystring = require('querystring');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/taxonomy/:datasetKey', getRoot);
router.get('/taxonomy/:datasetKey/:taxonKey', getTaxon);
router.get('/taxonomy/:datasetKey/:taxonKey/parents', getParents);
router.get('/taxonomy/:datasetKey/:taxonKey/children', getChildren);

function isOccurrence(req) {
    return req.query.occ == "true";
}


function getRoot(req, res, next) {
    if (isOccurrence(req)) {
        //use occ solr facets
        // as every occ record with a taxonKey must also have a kingdom, the kingdoms and other higher taxa should always come first in facets as they are most frequent
        return callApi(res, next, buildSolrQuery(req, null, 10), convertFacets);
    } else {
        callApi(res, next, apiConfig.taxonRoot.url + req.params.datasetKey, prunePage);
    }
};

function getTaxon(req, res, next) {
    callApi(res, next, apiConfig.taxon.url + req.params.taxonKey);
};

function getParents(req, res, next) {
    callApi(res, next, apiConfig.taxon.url + req.params.taxonKey + "/parents", pruneTaxa);
};

function getChildren(req, res, next) {
    if (isOccurrence(req)) {
        Taxon.get(req.params.taxonKey).then(function(tax) {
            //use occ solr facets
            callApi(res, next, buildSolrQuery(req, tax.record.rank, 100), convertFacets, extractHigherTaxa(tax.record));
        });
    } else {
        callApi(res, next, apiConfig.taxon.url + req.params.taxonKey + "/children?limit=100", prunePage);
    }
};

function nextLowerRank(rank) {
    if (rank) {
        var ranks = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
        var idx = _.indexOf(ranks, rank);
        if (idx >= 0) {
            return rank == 'species' ? 'taxon' : ranks[idx+1];
        }
        return '';
    }
    return 'kingdom';
}

function extractHigherTaxa(tax){
    return _.without([tax.kingdomKey, tax.phylumKey, tax.classKey, tax.orderKey, tax.familyKey, tax.genusKey, tax.speciesKey], undefined, '');
}
function buildSolrQuery(req, rank, limit){
    if (rank) {
        rank = rank.toLowerCase();
    }
    var url = apiConfig.occurrenceSearch.url + "?limit=0&facetLimit="+limit+"&datasetKey="+req.params.datasetKey+"&facet="+nextLowerRank(rank)+"Key";
    if (req.params.taxonKey && rank) {
        url = url + "&"+rank+"Key="+req.params.taxonKey;
    }
    return url;
}

function callApi(res, next, path, transform, idsToIgnore) {
    helper.getApiData(path, function (err, data) {
        if (data && typeof data.errorType !== 'undefined') {
            next(new Error(err));
        } else if (data) {
            if (transform) {
                transform(data, idsToIgnore).then(function(resolvedData) {
                    res.json(resolvedData);
                });
            } else {
                res.json(data);
            }
        } else {
            next(new Error(err));
        }
    }, {retries: 2, timeoutMilliSeconds: 10000});
};

function convertFacets(page, idsToIgnore) {
    var promises = [];
    page.count=page.facets.length;
    page.endOfRecords=true;
    _.each(page.facets[0].counts, function (fc){
        var key = Number(fc.name);
        if (_.indexOf(idsToIgnore, key) < 0) {
            promises.push(Taxon.get(key));
        }
    });
    delete page.facets;
    // finally return combined promise
    return new Promise(function(resolve, reject) {
        Promise.all(promises).then(function (p){
            page.results = _pruneTaxa(_.map(p, function(rec){
                return rec.record;
            }));
            resolve(page);
        });
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
    return _.map(
                _.remove(taxa, function (t) {
                    return _.indexOf(idsToIgnore, t.key) < 0
                })
        , function(tax) {
            return _.pick(
            tax, ['key', 'nameKey', 'acceptedKey', 'canonicalName', 'scientificName', 'rank']
        );
    });
}

