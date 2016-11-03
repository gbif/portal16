var express = require('express'),
    Taxon = require('../../../models/gbifdata/gbifdata').Taxon,
    Q = require('q'),
    _ = require('lodash'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/species2/:key(\\d+)\.:ext?', taxonRoute);
router.get('/taxon2/:key(\\d+)\.:ext?', taxonRoute);

function taxonRoute(req, res, next) {
    var key = req.params.key;
    getTaxon(key, res.locals.gb.locales.current).then(function (taxon) {
        renderPage(req, res, next, taxon);
    });
}

function getTaxon(key, lang) {
    var deferred = Q.defer();
    var getOptions = {
        //TODO: replace occ counts with solr facets
        expand: ['name', 'dataset', 'constituent', 'homonyms', 'typification', 'occurrenceGeoRefCount', 'occurrenceCount', 'vernacular', 'info']
    };

    Taxon.get(key, getOptions).then(function (taxon) {
        // this should be done server side in the future: http://dev.gbif.org/issues/browse/POR-307
        uniqPageResult(taxon.vernacular, function(v){
            return v.vernacularName + "|" + (v.language || '');
        }, function(v){
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
        // merge infos into single object
        mergeInfos(taxon);
        // remove self from homonyms
        _.remove(taxon.homonyms.results, function(tax) {
            return tax.key == key;
        });
        deferred.resolve(taxon);

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
function mergeInfos (taxon) {
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

function renderPage(req, res, next, taxon) {
    try {
        if (req.params.ext == 'debug') {
            res.json(taxon);
        } else {
            res.render('pages/species/key/speciesKey', {
                key: taxon.record.key,
                taxon: taxon,
                _meta: {
                    title: taxon.record.scientificName
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
