var express = require('express'),
    router = express.Router(),
    log = require('../../../config/log'),
    Article = require('../../models/article');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function (req, res) {
    //log.warn({randomAttribute: 'is test'}, 'My messagr grom the home controller');
    //log.error({randomAttribute: 'ERROR'}, 'My ERROR MESSAGE GOES HERE');
    var articles = [new Article(), new Article()];
    res.render('pages/home/home', {
        title: 'Portal',
        articles: articles,
        message: 'shouldn\'t be here'
    });
});
