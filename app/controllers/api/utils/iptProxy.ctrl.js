'use strict';
let express = require('express'),
    router = express.Router(),
    request = rootRequire('app/helpers/request'),
    log = require('../../../../config/log');

module.exports = function(app) {
    app.use('/api', router);
};

/**
 * This is a temporary proxy to compensate for the IPT not having set CORS headers. This should be updated in the IPT.
 * And until then this proxy belongs better in the registry https://github.com/gbif/registry/issues/35
 * But as a temporary measure as registry development is more cumbersome a proxy is added in the website.
 */
router.get('/installation/ipt/inventory/dataset', function(req, res) {
    let url = decodeURIComponent(req.query.iptBaseURL) + '/inventory/dataset';

    res.header('cache-control', 'max-age=0, no-store, must-revalidate');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    request({
        url: url,
        method: 'GET',
        json: true,
        fullResponse: true,
        maxAttempts: 1
    })
    .then(function(response) {
        res.header('Content-Type', response.headers['content-type'] || 'application/json');
        res.status(response.statusCode);
        res.send(response.body);
    })
    .catch(function(err) {
        log.error(err);
        res.sendStatus(500);
    });
});

