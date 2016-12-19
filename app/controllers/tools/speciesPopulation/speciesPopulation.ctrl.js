"use strict";

var express = require('express'),
    router = express.Router();
var deleteme = false;

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


router.get('/api/xmas/on', function (req, res, next) {
    deleteme = true;
    res.json({on: deleteme});
});

router.get('/api/xmas/off', function (req, res, next) {
    deleteme = false;
    res.json({on: deleteme});
});

router.get('/api/xmas/toggle', function (req, res, next) {
    deleteme = !deleteme;
    res.json({on: deleteme});
});

router.get('/api/speciespopulation/ison', function (req, res, next) {
    res.json({on: deleteme});
});

router.get('/api/xmas', function (req, res, next) {
    res.render('pages/tools/speciesPopulation/deleteme');
});