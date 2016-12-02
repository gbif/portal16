"use strict";
var express = require('express'),
    nunjucks = require('nunjucks'),
    github = require('octonode'),
    fs = require('fs'),
    _ = require('lodash'),
    sanitizeHtml = require('sanitize-html'),
    router = express.Router();

let issueTemplateString = fs.readFileSync(__dirname + '/issue.nunjucks', "utf8");

module.exports = function (app) {
    app.use('/api/tools/suggest-dataset', router);
};

router.post('/', function (req, res) {
    let formData = req.body.form;
    if (!formData || !isValid(formData)) {
        res.status(400);
        res.json({
            error: 'form data missing'
        });
    } else {
        createIssue(req.body.form, function (err, data) {
            if (err) {
                res.status(400);
                res.json({
                    error: 'could not write to github for some reason'
                });
            } else {
                res.json({
                    referenceId: data.html_url
                });
            }
        });
    }
});

function isValid(data) {
    if (_.isEmpty(data.title)) return false;
    if (_.isEmpty(data.region)) return false;
    if (_.isEmpty(data.taxon)) return false;
    return true;
}

function createIssue(data, cb) {
    let credentials = require('/etc/portal16/credentials');
    let description = '',
        labels = [];

    var client = github.client({
        username: credentials.github.user,
        password: credentials.github.password
    });

    var ghrepo = client.repo('gbif/data-mobilization');

    try {
        description = getDescription(data);
        labels = getLabels(data);
    } catch (err) {
        cb(err);
        return;
    }

    ghrepo.issue({
        "title": data.title,
        "body": description,
        "labels": labels
    }, function (err, data) {
        if (err) {
            cb(err);
        } else {
            cb(null, data);
        }
    });
}

function getLabels() {
    let labels = ['Needs validation'];
    //additional logic for tagging suggestions can go here. F.x. based on license or region.
    return _.uniq(labels);
}

function getDescription(data) {
    var res = nunjucks.renderString(issueTemplateString, data);
    return res;
}


