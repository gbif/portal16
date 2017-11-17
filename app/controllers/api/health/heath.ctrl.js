var express = require('express'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    router = express.Router(),
    getStatus = require('./notifications.model');
    tests = require('./tests'),
    health = require('./health.model');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/health', function (req, res) {
    let status = getStatus();
    res.json(status);
});