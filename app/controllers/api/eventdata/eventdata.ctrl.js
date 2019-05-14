'use strict';
let express = require('express'),
    router = express.Router(),
    request = rootRequire('app/helpers/request'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig');

module.exports = function(app) {
    app.use('/api/eventdata', router);
};

router.get('/dataset/:key', function(req, res) {
    let key = req.params.key;
    eventData(key)
        .then(function(result) {
            res.setHeader('Cache-Control', 'public, max-age=' + 86400);// 1 day
            res.json(result);
        })
        .catch(function(err) {
            res.sendStatus(500);
        });
});

async function eventData(key) {
    let dataset = await getDataset(key);
    let eventData = await getEventData(dataset.doi);
    return eventData;
}

async function getEventData(doi) {
    let options = {
        url: 'http://api.eventdata.crossref.org/v1/events?mailto=systems@gbif.org&facet=source:10&rows=0&obj-id=' + doi,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        // TODO log error
        throw 'Internal server error getting data';
    }
    return response.body;
}

async function getDataset(key) {
    let options = {
        url: apiConfig.dataset.url + key,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        // TODO log error
        throw 'Internal server error getting data';
    }
    return response.body;
}
