var express = require('express'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    router = express.Router(),
    tests = require('./tests'),
    health = require('./health.model');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/_health', function (req, res) {
    health.statusCheck(tests).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        console.log(err)
    });
});