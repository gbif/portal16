'use strict';

let express = require('express');
let querystring = require('querystring');
let queryResolver = require('./queryResolver');
let router = express.Router();
let request = require('requestretry');
let downloadHelper = require('./downloadKeyHelper');
let apiConfig = rootRequire('app/models/gbifdata/apiConfig');

module.exports = function(app) {
    app.use('/api/occurrence', router);
};

router.get('/search/predicate.html', function(req, res, next) {
    getTransformedPredicate(req.query, res.__mf).then(function(context) {
        // res.json(context);
        res.render('pages/occurrence/download/key/predicateOnly', {decoratedPredicate: context.request.predicate});
    })
    .catch(function() {
        res.sendStatus(500);
    });
});

async function getPredicate(query) {
    let options = {
        // url: 'http://api.gbif.org/v1/occurrence/download/0016308-180131172636756',
        url: apiConfig.occurrenceSearch.url + 'predicate?' + querystring.stringify(query),
        method: 'GET',
        maxAttempts: 1,
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw new Error('Failed API query');
    }
    return response.body;
}

async function getTransformedPredicate(query, __mf) {
    let occurrenceRequest = await getPredicate(query);
    let promiseList = [];
    let context = {};
    context.predicateString = JSON.stringify(occurrenceRequest.predicate, undefined, 2);
    downloadHelper.addChildKeys(occurrenceRequest.predicate);
    downloadHelper.addSyntheticTypes(occurrenceRequest.predicate);
    downloadHelper.setDepths(occurrenceRequest.predicate);
    context.isSimple = downloadHelper.getSimpleQuery(occurrenceRequest.predicate);
    downloadHelper.flattenSameType(occurrenceRequest.predicate);
    downloadHelper.addpredicateResolveTasks(occurrenceRequest.predicate, queryResolver, promiseList, __mf);
    await Promise.all(promiseList);
    context.request = occurrenceRequest;
    return context;
}
