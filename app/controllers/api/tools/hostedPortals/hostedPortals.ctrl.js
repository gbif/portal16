'use strict';

let express = require('express'),
    nunjucks = require('nunjucks'),
    github = require('octonode'),
    credentials = rootRequire('config/credentials').hostedPortals,
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
        createIssue(formData, req, function(err, data) {
            if (err) {
                log.error('Could not write feedback to Github issue: ' + err);
                res.status(400);
                res.json({
                    error: 'Unable to save the form. Please report this error.'
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
  // we will just accept whatever and fail if it cannot be parsed
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
        data.participantTitle = _.get(data, 'participant.participantTitle', '_no participant selected_');
        data.participantCountry = _.get(data, 'participant.country');
        delete data.participant;
        description = getDescription({form: data, formString: JSON.stringify(data, null, 2)});
        // description = getDescription({form: data, formString: 'line\ntwo'});
        labels = getLabels(data);
    } catch (err) {
        cb(err);
        return;
    }

    console.log(description);
    cb('no no no', data);
    // ghrepo.issue({
    //     'title': data.portal_name,
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
    let labels = ['REVIEW MANAGER NEEDED'];
    // additional logic for tagging suggestions can go here. F.x. based on license or region.
    return _.uniq(labels);
}

function getDescription(data) {
    let res = nunjucks.renderString(issueTemplateString, data);
    return res;
}


