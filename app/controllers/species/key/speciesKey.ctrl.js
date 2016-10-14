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
        expand: ['name','constituent','synonyms','combinations',
            'occurrenceGeoRefCount','occurrenceCount',
            'media','references','vernacular','typification']
    };

    Taxon.get(key, getOptions).then(function (taxon) {
        // pick one vernacular name of requested language
        taxon.vernacular.results.some(function (v) {
            //TODO: create lookup map for 3 letter iso codes to 2 letter ones as used by the locale
            if (v.language == lang || v.language=='eng') {
                this.record.vernacularName = v.vernacularName;
                this.record.vernacularLang = v.language;
            }
            return v.language == lang;
        });
        deferred.resolve(taxon);

    }, function (err) {
        deferred.reject(new Error(err));
    }).fail(function (err) {
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
                taxon: taxon,
                _meta: {
                    title: 'Taxon Detail ' + req.params.key
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
