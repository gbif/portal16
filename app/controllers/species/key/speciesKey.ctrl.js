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
    var key = req.params.key;
    getTaxon(key, res.locals.gb.locales.current).then(function(taxon){
        renderPage(req, res, next, taxon);
    });
}

function getTaxon(key, lang) {
    var deferred = Q.defer();
    var getOptions = {
        // TODO: load these async through angular to respond quicker:
        // 'synonyms','combinations','references','typification'
        //TODO:
        expand: ['name', 'constituent', 'occurrenceGeoRefCount', 'occurrenceCount', 'vernacular']
    };

    Taxon.get(key, getOptions).then(function (taxon) {
        // pick one vernacular name of requested language
        taxon.vernacular.results.some(function (v) {
            //TODO: create lookup map for 3 letter iso codes to 2 letter ones as used by the locale
            // use http://api.gbif-dev.org/v1/enumeration/language
            if (v.language == lang || v.language=='eng') {
                taxon.record.vernacularName = v.vernacularName;
                taxon.record.vernacularLang = v.language;             }
            return v.language == lang || v.language=='eng';
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
