'use strict';

const { V4MAPPED } = require('dns');

let express = require('express'),
    nunjucks = require('nunjucks'),
    github = require('octonode'),
    credentials = rootRequire('config/credentials').suggestDataset,
    log = rootRequire('config/log'),
    fs = require('fs'),
    _ = require('lodash'),
    router = express.Router({caseSensitive: true});

let issueTemplateString = fs.readFileSync(__dirname + '/issue.nunjucks', 'utf8');

module.exports = function(app) {
    app.use('/api/tools/hosted-portals', router);
};

router.post('/', function(req, res) {
    let formData = req.body.form;
    if (!formData || !isValid(formData)) {
        res.status(400);
        res.json({
            error: 'form data missing'
        });
    } else {
        createIssue(req.body.form, req, function(err, data) {
            if (err) {
                log.error('Could not write feedback to Github issue: ' + err);
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
  return true;
    if (_.isEmpty(data.title)) return false;
    if (_.isEmpty(data.region)) return false;
    if (_.isEmpty(data.taxon)) return false;
    return true;
}

function createIssue(data, req, cb) {
    let description = '',
        labels = [];

    let client = github.client({
        username: credentials.user,
        password: credentials.password
    });

    let ghrepo = client.repo(credentials.repository);

    try {
        description = getDescription(data);
        labels = getLabels(data);
    } catch (err) {
        cb(err);
        return;
    }

    console.log(data, description);
    cb(null, data);
    // ghrepo.issue({
    //     'title': data.title,
    //     'body': description,
    //     'labels': labels
    // }, function(err, data) {
    //     if (err) {
    //         cb(err);
    //     } else {
    //         cb(null, data);
    //     }
    // });
}


function getLabels() {
    let labels = ['Needs validation'];
    // additional logic for tagging suggestions can go here. F.x. based on license or region.
    return _.uniq(labels);
}

function getDescription(data) {
    let res = nunjucks.renderString(issueTemplateString, data);
    return res;
}


