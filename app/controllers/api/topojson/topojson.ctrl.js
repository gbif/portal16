'use strict';

/**
 * @fileOverview Serve topojson object to the client side, so it's loaded only when used
 */

const express = require('express'),
    router = express.Router(),
    worldRobinson = require('./world-robinson-topo.json');
    //apicache = require('apicache');

//let cache = apicache.middleware;

module.exports = app => {
    app.use('/api', router);
};

router.get('/topojson/world-robinson', (req, res, next) => {
    res.json(worldRobinson);
});
