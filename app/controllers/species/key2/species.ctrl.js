var express = require('express'),
    _ = require('lodash'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/species2/:key(\\d+)\.:ext?', function render(req, res) {
    res.render('pages/species/key2/speciesKey', {
        key: req.params.key,
        _meta: {
            title: 'species',
            hasTools: true,
            hideFooter: true
        }
    });
});


router.get('/species2/:key(\\d+)/references\.:ext?', function render(req, res) {
    res.render('pages/species/key2/speciesKey', {
        key: req.params.key,
        _meta: {
            title: 'species',
            hasTools: true,
            hideFooter: true
        }
    });
});