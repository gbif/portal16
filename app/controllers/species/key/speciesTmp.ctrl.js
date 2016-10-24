var express = require('express'),
    Taxon = require('../../../models/gbifdata/gbifdata').Taxon,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/species/:key(\\d+)\.:ext?', taxonRoute);
router.get('/taxon/:key(\\d+)\.:ext?', taxonRoute);

function taxonRoute(req, res, next) {
    var key = req.params.key;
    Taxon.get(key, {expand: ['name']}).then(function (taxon) {
        renderPage(req, res, next, taxon);
    }, function (err) {
        next(err);
    });
}

function renderPage(req, res, next, taxon) {
    try {
        if (req.params.ext == 'debug') {
            res.json(taxon);
        } else {
            res.render('pages/species/key/speciesKey_tmp', {
                species: taxon,
                _meta: {
                    title: 'Taxon ' + req.params.key
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
