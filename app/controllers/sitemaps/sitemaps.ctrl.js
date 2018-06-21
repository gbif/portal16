'use strict';
let express = require('express'),
    router = express.Router(),
    helper = rootRequire('app/models/util/util'),
    pager = require('./pager'),
    species = require('./species'),
    log = require('../../../config/log'),
    prose = require('./prose');


module.exports = function(app) {
    app.use('/', router);
};

router.get('/sitemap.xml', function(req, res, next) {
    res.set('Content-Type', 'text/xml');
    helper.renderPage(req, res, next, {
    }, 'sitemaps/index');
});

// prose
router.get('/sitemap-prose.xml', function(req, res, next) {
    res.set('Content-Type', 'text/xml');
    prose.getAllProse().then(function(pages) {
        helper.renderPage(req, res, next, {
            pages: pages
        }, 'sitemaps/prose');
    }).catch(function(err) {
        log.error(err);
        next(err);
    });
});

// networks
router.get('/sitemap-network.xml', getIntervals(pager.network.intervals, 'sitemaps/network/index'));
router.get('/sitemap/network/:offset/:limit.xml', getList(pager.network.list, 'sitemaps/network/network'));

// installation
router.get('/sitemap-installation.xml', getIntervals(pager.installation.intervals, 'sitemaps/installation/index'));
router.get('/sitemap/installation/:offset/:limit.xml', getList(pager.installation.list, 'sitemaps/installation/installation'));

// node
router.get('/sitemap-node.xml', getIntervals(pager.node.intervals, 'sitemaps/node/index'));
router.get('/sitemap/node/:offset/:limit.xml', getList(pager.node.list, 'sitemaps/node/node'));

// dataset
router.get('/sitemap-dataset.xml', getIntervals(pager.dataset.intervals, 'sitemaps/dataset/index'));
router.get('/sitemap/dataset/:offset/:limit.xml', getList(pager.dataset.list, 'sitemaps/dataset/dataset'));

// publisher
router.get('/sitemap-publisher.xml', getIntervals(pager.publisher.intervals, 'sitemaps/publisher/index'));
router.get('/sitemap/publisher/:offset/:limit.xml', getList(pager.publisher.list, 'sitemaps/publisher/publisher'));

// species in backbone
// router.get('/sitemap-species.xml', getIntervals(pager.species.intervals, 'sitemaps/species/index'));
// router.get('/sitemap/species/:offset/:limit.xml', getList(pager.species.list, 'sitemaps/species/species'));
// species in backbone
router.get('/sitemap-species.xml', function(req, res, next) {
    species.getSpeciesSiteMapIndex().then(function(sitemapIndex) {
        res.set('Content-Type', 'text/xml');
        res.send(sitemapIndex);
    }).catch(function(e) {
        next(e);
    });
});
router.get('/sitemap/species/:no.txt', function(req, res, next) {
    species.getSpeciesSiteMap(req.params.no).then(function(sitemap) {
        res.set('Content-Type', 'text/plain');
        res.send(sitemap);
    }).catch(function(e) {
        next(e);
    });
});


function getIntervals(f, template) {
    return function(req, res, next) {
        res.set('Content-Type', 'text/xml');
        f().then(function(pages) {
            helper.renderPage(req, res, next, {
                pages: pages
            }, template);
        })
        .catch(function(err) {
            log.error(err);
            next(err);
        });
    };
}

function getList(f, template) {
    return function(req, res, next) {
        res.set('Content-Type', 'text/xml');
        let query = {
            offset: req.params.offset,
            limit: req.params.limit
        };
        f(query).then(function(pages) {
            helper.renderPage(req, res, next, {
                pages: pages
            }, template);
        }).catch(function(err) {
            log.error(err);
            next(err);
        });
    };
}
