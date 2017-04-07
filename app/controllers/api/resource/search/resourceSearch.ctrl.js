"use strict";
var express = require('express'),
    router = express.Router(),
    elasticsearch = require('elasticsearch'),
    _ = require('lodash'),
    resourceSearch = require('./resourceSearch'),
    resourceResultParser = require('./resourceResultParser'),
    localeMap = { //TODO move to configuration file where site languages is defined
        'en': 'en-GB',
        'da': 'da-DK'
    };


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

router.get('/resource/search', function (req, res) {
    let query = resourceSearch.buildQuery(req.query),
        preferedLocale = req.query.locale;

    client.search(query).then(function (resp) {
        var parsedResult = resourceResultParser.normalize(resp, query.from, query.size);
        resourceResultParser.renameField(parsedResult.results, 'literature', 'abstract', 'summary');//rename literature.abcstract to summary for consistency with other content types
        resourceResultParser.renameField(parsedResult.results, 'event', 'description', 'summary');

        resourceResultParser.selectLocale(parsedResult.results, ['body', 'summary', 'title', 'primaryImage.description', 'primaryImage.file', 'primaryImage.title'], localeMap[preferedLocale], localeMap.en);
        resourceResultParser.renderMarkdown(parsedResult.results, ['body', 'summary', 'title']);
        resourceResultParser.stripHtml(parsedResult.results, ['body', 'summary', 'title']);
        resourceResultParser.concatFields(parsedResult.results, ['summary', 'body'], '_summary');
        resourceResultParser.truncate(parsedResult.results, ['title'], 100);
        resourceResultParser.truncate(parsedResult.results, ['body', 'summary', '_summary'], 200);
        resourceResultParser.addSlug(parsedResult.results, 'title', localeMap[preferedLocale], localeMap.en);

        //resourceResultParser.include(parsedResult).then(function(includedData){
        //    parsedResult.includes = includedData;
        //    res.json(parsedResult);
        //});

        res.json(parsedResult);
    }, function (err) {
        console.trace(err.message);
    });
});
