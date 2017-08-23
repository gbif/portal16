"use strict";

var express = require('express'),
    utils = rootRequire('app/helpers/utils'),
    helper = rootRequire('app/models/util/util'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    Taxon = require('../../../models/gbifdata/gbifdata').Taxon,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/species/:key/verbatim', function render(req, res, next) {
    renderSpeciesPage(req, res, next);
});

router.get('/species/:key(\\d+)\.:ext?', function render(req, res, next) {
    renderSpeciesPage(req, res, next);
});

router.get('/species/:key(\\d+)/:ignore', function render(req, res) {
    res.redirect(302, res.locals.gb.locales.urlPrefix + '/species/' + req.params.key);
});




function renderSpeciesPage(req, res, next) {
    let speciesKey = req.params.key;
    var options = {
        expand: ['descriptions', 'dataset', 'synonyms', 'combinations', 'media', 'references', 'homonyms', 'vernacular']
    };

    Taxon.get(speciesKey, options).then(function (taxon){
        let contentItem = {
            species: taxon,
            _meta: {
                title: taxon.record.scientificName
            }
        };
        helper.renderPage(req, res, next, contentItem, 'pages/species/key2/seo');
    }).catch(function(err){
        next(err);
    });
}
