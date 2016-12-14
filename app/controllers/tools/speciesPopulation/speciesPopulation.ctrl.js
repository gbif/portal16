"use strict";

var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/tools/species-population', function (req, res, next) {
    render(req, res, next, {
        _meta: {
            title: 'Species Population',
            hideFooter: true
        }
    });
});

function render(req, res, next, data) {
    try {
        res.render('pages/tools/speciesPopulation/speciesPopulation', data);
    } catch (err) {
        next(err);
    }
}