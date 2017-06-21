"use strict";
let express = require('express'),
    nunjucks = require('nunjucks'),
    fs = require('fs'),
    log = rootRequire('config/log'),
    notifications = require('./notifications.model'),
    //issueTemplateString = fs.readFileSync(__dirname + '/issue.nunjucks', "utf8"),
    router = express.Router();

module.exports = function (app) {
    app.use('/api/notifications', router);
};

router.get('/', function (req, res) {
    notifications.getNotifications().then(function(result){
        res.json(result);
    }).catch(function(err){
        res.status(500);
        res.send(err);
    });
});

//temporary hack to embde in on the drupal page as a script
router.get('/script.js', function (req, res) {
    notifications.getNotifications().then(function(result){
        res.setHeader('content-type', 'text/javascript');
        res.end('window._notification = ' + JSON.stringify(result) + '; window.addWarning();');
    }).catch(function(err){
        res.status(500);
        res.send(err);
    });
});
