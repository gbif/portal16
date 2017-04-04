"use strict";
var express = require('express'),
    router = express.Router(),
    elasticsearch = require('elasticsearch'),
    _ = require('lodash'),
    resourceSearch = require('./resourceSearch'),
    resourceResultParser = require('./resourceResultParser');


var client = new elasticsearch.Client({
    host: {
        protocol: 'http',
        host: 'develastic-vh.gbif.org',
        port: 9200
    }
});

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/contentful/search', function (req, res) {

    let query = resourceSearch.buildQuery(req.query);
    client.search(query).then(function (resp) {
        var parsedResult = resourceResultParser.normalize(resp, query.from, query.size);
        res.json(parsedResult);
    }, function (err) {
        console.trace(err.message);
    });
});