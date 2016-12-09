"use strict";
var express = require('express'),
    //github = require('octonode'),
    //credentialsPath = rootRequire('config/config').credentials,
    //credentials = require(credentialsPath).portalFeedback,
    //log = rootRequire('config/log'),
    router = express.Router();

module.exports = function (app) {
    app.use('/api/notifications', router);
};

router.get('/announcements', function (req, res, next) {
    res.json(
        {
            total_count: 1,
            items: [
                {
                    title: 'scheduled downtime oct 10 2016',
                    body: 'we plan to do some updates so be aware that the site will be unstable',
                    id: '469283'
                }
            ]
        }
    );

});

router.get('/template.html', function (req, res, next) {
    try {
        res.render('shared/layout/partials/notifications/notificationsDirective');
    } catch (err) {
        next(err);//TODO not ideal error handling for an angular template. What would be a better way?
    }

});

