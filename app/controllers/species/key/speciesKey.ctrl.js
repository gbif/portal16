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
    Taxon.get(key, {expand: ['dataset']}).then(function (taxon) {
        renderPage(req, res, next, taxon);
    }, function (err) {
        //TODO should this be logged here or in model/controller/api?
        //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
        console.log('error in ctrl ' + err);
        next();
    });
}

function renderPage(req, res, next, taxon) {
    try {
        if (req.params.ext == 'debug') {
            res.json(taxon);
        } else {
            res.render('pages/species/key/speciesKey', {
                species: taxon,
                _meta: {
                    title: 'Taxon Detail ' + req.params.key
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
