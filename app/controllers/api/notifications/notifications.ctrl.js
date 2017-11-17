"use strict";
let express = require('express'),
    nunjucks = require('nunjucks'),
    log = rootRequire('config/log'),
    notifications = require('./notifications.model'),
    router = express.Router();

module.exports = function (app) {
    app.use('/api/notifications', router);
};

router.get('/', function (req, res) {
    notifications.getNotifications(req.__).then(function(result){
        res.setHeader('Cache-Control', 'public, max-age=' + 30);//30 seconds
        res.json(result);
    }).catch(function(err){
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
        res.status(500);
        res.send(err);
    });
});

router.get('/template.html', function (req, res, next) {
    try {
        res.render('shared/layout/partials/notifications/notificationsDirective');
    } catch (err) {
        next(err);//TODO not ideal error handling for an angular template. What would be a better way?
    }

});

