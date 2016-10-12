"use strict";
var express = require('express'),
    hash = require('object-hash'),
    nunjucks = require('nunjucks'),
    github = require('octonode'),
    fs = require('fs'),
    _ = require('lodash'),
    router = express.Router(),
    querystring = require('querystring');

let issueTemplateString = fs.readFileSync(__dirname + '/issue.nunjucks', "utf8");
let typeOptions = ["OCCURRENCE", "CHECKLIST", "SAMPLING_EVENT", "METADATA", "undefined"];

module.exports = function (app) {
    app.use('/api/tools/suggest-dataset', router);
};

router.post('/', function (req, res, next) {
    let formData = req.body.form;
    if (!formData || isValid(formData)) {
        res.status(400);
        res.json({
            error: 'form data missing'
        });
    } else {
        createIssue(req.body.form, function (err, data) {
            if (err) {
                res.status(400);
                res.json({
                    error: err
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
    if (_.isEmpty(data.datasetLink)) return false;
    if (_.isEmpty(data.region)) return false;
    if (_.isEmpty(data.taxon)) return false;
    if (_.isEmpty(data.type) || typeOptions.indexOf(data.type) < 0) return false;
    return true;
}

function createIssue(data, cb) {
    let credentials = require('/tmp/credentials');
    let description = '',
        labels = [];

    var client = github.client({
        username: credentials.github.user,
        password: credentials.github.password
    });

    var ghrepo = client.repo('gbif/data-mobilisation');

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
    }, function (err, data, headers) {
        if (err) {
            cb(err);
        } else {
            cb(null, data);
        }
    });
}

function getLabels(data) {
    let labels = ['Needs validation'];
    if (data.region) {
        labels.push(data.region);
    }
    if (data.country) {
        labels.push(data.country);
    }
    if (data.openLicence) {
        labels.push('Open license');
    }
    return _.uniq(labels);
}

function getDescription(data) {
    var res = nunjucks.renderString(issueTemplateString, data);
    return res;
}


