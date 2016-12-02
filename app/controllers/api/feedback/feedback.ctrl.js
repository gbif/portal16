"use strict";
var express = require('express'),
    nunjucks = require('nunjucks'),
    github = require('octonode'),
    fs = require('fs'),
    useragent = require('useragent'),
    _ = require('lodash'),
    router = express.Router();

let issueTemplateString = fs.readFileSync(__dirname + '/issue.nunjucks', "utf8");

module.exports = function (app) {
    app.use('/api/feedback/bug', router);
};

router.post('/', function (req, res) {
    let formData = req.body.form;
    if (!formData || !isValid(formData)) {
        res.status(400);
        res.json({
            error: 'form data missing'
        });
    } else {
        createIssue(req, req.body, function (err, data) {
            if (err) {
                res.status(400);
                res.json({
                    error: 'could not write to github for some reason'
                });
            } else {
                res.json({
                    //referenceId: data.html_url,
                    description: data
                });
            }
        });
    }
});

function isValid(data) {
    if (_.isEmpty(data.description)) return false;
    if (_.isEmpty(data.title)) return false;
    return true;
}

function createIssue(req, data, cb) {
    let agent = useragent.parse(req.headers['user-agent']),
        credentials = require('/etc/portal16/credentials');
    var description = '',
        labels = [];

    try {
        description = getDescription(data, agent);
        labels = getLabels(data);
    } catch (err) {
        cb(err);
        return;
    }

    cb(null, description);

    //var client = github.client({
    //    username: credentials.github.user,
    //    password: credentials.github.password
    //});
    //
    //var ghrepo = client.repo('gbif/portal-feedback');
    //ghrepo.issue({
    //    "title": 'portal user test',
    //    "body": description,
    //    "labels": labels
    //}, function (err, data) {
    //    if (err) {
    //        cb(err);
    //    } else {
    //        cb(null, data);
    //    }
    //});
}

function getLabels() {
    let labels = ['Needs validation', 'Bug'];
    //additional logic for tagging suggestions can go here. F.x. based on license or region.
    return _.uniq(labels);
}

function getDescription(data, agent) {
    data.__agent = agent.toString();
    var res = nunjucks.renderString(issueTemplateString, data);
    return res;
}


