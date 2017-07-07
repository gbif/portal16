"use strict";
let express = require('express'),
    router = express.Router(),
    helper = rootRequire('app/models/util/util'),
    datasets = require('./datasets'),
    species = require('./species'),
    publishers = require('./publisher'),
    prose = require('./prose');


module.exports = function (app) {
    app.use('/', router);
};

router.get('/sitemap.xml', function (req, res, next) {
    res.set('Content-Type', 'text/xml');
    helper.renderPage(req, res, next, {
    }, 'sitemaps/index');
});

//prose
router.get('/sitemap/prose.xml', function (req, res, next) {
    res.set('Content-Type', 'text/xml');
    prose.getAllProse().then(function(pages){
        helper.renderPage(req, res, next, {
            pages: pages
        }, 'sitemaps/prose');
    });
});

//Datasets
router.get('/sitemap/dataset.xml', function (req, res, next) {
    res.set('Content-Type', 'text/xml');
    datasets.getDatasetIntervals().then(function(pages){
        helper.renderPage(req, res, next, {
            pages: pages
        }, 'sitemaps/dataset/index');
    });
});

router.get('/sitemap/dataset/:offset/:limit.xml', function (req, res, next) {
    res.set('Content-Type', 'text/xml');
    let query = {
        offset: req.params.offset,
        limit: req.params.limit
    };
    datasets.getDatasets(query).then(function(pages){
        helper.renderPage(req, res, next, {
            pages: pages
        }, 'sitemaps/dataset/dataset');
    });
});


//Publishers
router.get('/sitemap/publisher.xml', function (req, res, next) {
    res.set('Content-Type', 'text/xml');
    publishers.getPublisherIntervals().then(function(pages){
        helper.renderPage(req, res, next, {
            pages: pages
        }, 'sitemaps/publisher/index');
    });
});

router.get('/sitemap/publisher/:offset/:limit.xml', function (req, res, next) {
    res.set('Content-Type', 'text/xml');
    let query = {
        offset: req.params.offset,
        limit: req.params.limit
    };
    publishers.getPublisher(query).then(function(pages){
        helper.renderPage(req, res, next, {
            pages: pages
        }, 'sitemaps/publisher/publisher');
    });
});

//species in backbone
router.get('/sitemap/species.xml', function (req, res, next) {
    res.set('Content-Type', 'text/xml');
    species.getSpeciesIntervals().then(function(pages){
        helper.renderPage(req, res, next, {
            pages: pages
        }, 'sitemaps/species/index');
    });
});

router.get('/sitemap/species/:offset/:limit.xml', function (req, res, next) {
    res.set('Content-Type', 'text/xml');
    let query = {
        offset: req.params.offset,
        limit: req.params.limit
    };
    species.getSpecies(query).then(function(pages){
        helper.renderPage(req, res, next, {
            pages: pages
        }, 'sitemaps/species/species');
    });
});
