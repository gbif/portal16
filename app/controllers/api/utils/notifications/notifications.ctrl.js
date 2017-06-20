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
    notifications.getNotifications(req.query.since).then(function(result){
        res.json(result);
    }).catch(function(err){
        res.status(500);
        res.send(err);
    });
});

