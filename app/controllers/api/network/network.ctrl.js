'use strict';
let express = require('express'),
    router = express.Router({caseSensitive: true}),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    request = rootRequire('app/helpers/request'),
    _ = require('lodash'),
    querystring = require('querystring');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/networkKey/suggest', function(req, res, next) {
    searchNetworks(req.query).then(function(suggestions) {
        res.json(suggestions);
    }).catch(function() {
        res.sendStatus(500);
    });
});

async function searchNetworks(query) {
    let baseRequest = {
        url: apiConfig.network.url + '?' + querystring.stringify(query),
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let response = await request(baseRequest);
    if (response.statusCode > 299) {
        throw response;
    }
    let networks = response.body;
    return _.map(networks.results, function(e) {
        return {
            key: e.key,
            title: e.title
        };
    });
}
