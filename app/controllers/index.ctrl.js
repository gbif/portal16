var express = require('express'),
    router = express.Router(),
//log = require('../../../config/log'),
    marked = require('marked'),
    Article = require('../models/article');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function (req, res) {
    //log.warn({randomAttribute: 'is test'}, 'My messagr grom the home controller');
    //log.error({randomAttribute: 'ERROR'}, 'My ERROR MESSAGE GOES HERE');
    if (typeof req.query.q !== 'undefined') {
        res.redirect(res.locals.gb.locales.urlPrefix + '/search?q=' + req.query.q);
    } else {
        var articles = [new Article(), new Article()];
        res.render('pages/home/home', {
            title: 'Portal',
            articles: articles,
            message: 'shouldn\'t be here',
            _meta: {
                hideSearchAction: true
            }
        });
    }
});
