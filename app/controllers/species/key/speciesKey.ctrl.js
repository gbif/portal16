var express = require('express'),
    Taxon = require('../../../models/gbifdata/gbifdata').Taxon,
    Q = require('q'),
    _ = require('lodash'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/species/:key(\\d+)\.:ext?', taxonRoute);
router.get('/taxon/:key(\\d+)\.:ext?', taxonRoute);

function taxonRoute(req, res, next) {
    render(req, res, next, ['name', 'dataset', 'constituent', 'homonyms', 'typification', 'occurrenceGeoRefCount', 'occurrenceCount', 'vernacular', 'info']);
}

function render(req, res, next, lookups) {
    try {
        getTaxon(req.params.key, res.locals.gb.locales.current, lookups).then(function (taxon) {
            if (!taxon.isNub()) {
                redirectToDatasetTaxon(res, taxon);
            } else {
                res.render('pages/species/key/speciesKey', {
                    key: taxon.record.key,
                    taxon: taxon,
                    _meta: {
                        title: taxon.record.scientificName
                    }
                });
            }
        });
    } catch (e) {
        console.error(e);
        next();
    }
}

function redirectToDatasetTaxon(res, taxon) {
    res.redirect('/dataset/' + taxon.record.datasetKey + '/taxonomy/' + taxon.record.key);
}

function getTaxon(key, lang, lookups) {
    var deferred = Q.defer();
    var getOptions = {
        //TODO: replace occ counts with solr facets
        expand: lookups,
        expandBackboneOnly: true
    };

    Taxon.get(key, getOptions).then(function (taxon) {
        // this should be done server side in the future: http://dev.gbif.org/issues/browse/POR-307
        if (taxon.vernacular) {
            uniqPageResult(taxon.vernacular, function (v) {
                return v.vernacularName + "|" + (v.language || '');
            }, function (v) {
                return v.language;
            });
            // pick one vernacular name of requested language
            taxon.vernacular.results.some(function (v) {
                //TODO: create lookup map for 3 letter iso codes to 2 letter ones as used by the locale
                // use http://api.gbif-dev.org/v1/enumeration/language
                if (v.language == lang || v.language == 'eng') {
                    taxon.record.vernacularName = v.vernacularName;
                    taxon.record.vernacularLang = v.language;
                }
                return v.language == lang || v.language == 'eng';
            });
        }
        // merge infos into single object
        mergeInfos(taxon);
        // remove self from homonyms
        if (taxon.homonyms) {
            _.remove(taxon.homonyms.results, function (tax) {
                return tax.key == key;
            });
        }
        // verify source usage actually exists
        if (taxon.record.sourceTaxonKey > 0) {
            Taxon.get(taxon.record.sourceTaxonKey).then(function (srcTaxon) {
                taxon.record.sourceTaxonExists = true;
                deferred.resolve(taxon);
            }, function (err) {
                taxon.record.sourceTaxonExists = false;
                deferred.resolve(taxon);
            }).done();
        } else {
            deferred.resolve(taxon);
        }

    }, function (err) {
        console.log(err);
        deferred.reject(new Error(err));

    }).fail(function (err) {
        console.log(err);
        deferred.reject(new Error(err));
    }).done();

    return deferred.promise;
}

// aggregates all species infos into 1 object
//TODO: do in backbone & server see http://dev.gbif.org/issues/browse/POR-358
function mergeInfos(taxon) {
    var info = {};
    if (taxon.info) {
        _.each(taxon.info.results, function (i) {
            _.merge(info, i);
        });
    }
    taxon.info = info;
}

function uniqPageResult(page, hashFunc, sortFunc) {
    page.results = _.sortedUniqBy(_.sortBy(page.results, sortFunc), hashFunc);
}


