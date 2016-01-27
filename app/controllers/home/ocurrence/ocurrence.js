var express = require('express'),
    router = express.Router(),
    log = rootRequire('config/log');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/ocurrence', function (req, res) {
    //log.warn({randomAttribute: 'is test'}, 'My messagr grom the home controller');
    //log.error({randomAttribute: 'ERROR'}, 'My ERROR MESSAGE GOES HERE');
    res.render('pages/ocurrence/ocurrence', {
        title: 'Ocurrences',
        message: 'yada yada',
        hasDrawer: true,
        hasTools: true
    });
});
