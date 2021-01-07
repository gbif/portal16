'use strict';
let express = require('express'),
    router = express.Router(),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    request = require('request-promise');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/publisher/count', async function(req, res, next) {
    let baseRequest = {
        url: apiConfig.publisher.url + 'count',
        timeout: 15000,
        method: 'GET',
        fullResponse: true
    };
    try {
        const response = await request(baseRequest);
        return res.status(200).json({count: Number(response)});
    } catch (err) {
        if (err.statusCode !== 200) {
            throw err;
        }
    }
});
