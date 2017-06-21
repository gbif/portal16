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
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
        res.json(result);
    }).catch(function(err){
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
        res.status(500);
        res.send(err);
    });
});

//temporary hack to embde in on the drupal page as a script
router.get('/script.js', function (req, res) {
    notifications.getNotifications().then(function(result){
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
        res.setHeader('content-type', 'text/javascript');
        res.end('window._notification = ' + JSON.stringify(result) + '; window.addWarning();');
    }).catch(function(err){
        res.status(500);
        res.send(err);
    });
});
