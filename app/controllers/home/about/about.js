var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/about', function (req, res) {
    //log.warn({randomAttribute: 'is test'}, 'My messagr grom the home controller');
    //log.error({randomAttribute: 'ERROR'}, 'My ERROR MESSAGE GOES HERE');
    res.render('pages/about/about', {
        title: 'About',
        message: 'shouldn\'t be here'
    });
});
