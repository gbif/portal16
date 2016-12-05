"use strict";
var express = require('express'),
    nunjucks = require('nunjucks'),
    github = require('octonode'),
    fs = require('fs'),
    credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).portalFeedback,
    useragent = require('useragent'),
    feedbackContentType = require('./feedbackContentType'),
    _ = require('lodash'),
    log = rootRequire('config/log'),
    router = express.Router();

let issueTemplateString = fs.readFileSync(__dirname + '/issue.nunjucks', "utf8");

module.exports = function (app) {
    app.use('/api/feedback', router);
};

router.get('/template.html', function (req, res, next) {
    try {
        res.render('shared/layout/partials/feedback/feedbackDirective', {});
    } catch (err) {
        next(err);//TODO not ideal error handling for an angular template. What would be a better way?
    }
});

router.get('/content', function (req, res, next) {
    //var path = req.query.path,
    //    feedbackType = getFeedbackContentType(path);
    res.json('sdf');
});

router.post('/bug', function (req, res) {
    let formData = req.body.form;
    if (!formData || !isValid(formData)) {
        res.status(400);
        res.json({
            error: 'form data missing'
        });
    } else {
        createIssue(req, req.body, function (err, data) {
            if (err) {
                res.status(500);
                res.json({
                    error: 'Couldn\'t write the issue to Github'
                });
                log.error('Could not write feedback to Github issue: ' + err);
            } else {
                res.json({
                    referenceId: data.html_url
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
        referer = req.headers.referer;
    var description = '',
        labels = [];

    try {
        description = getDescription(data, agent, referer);
        labels = getLabels(data);
    } catch (err) {
        cb(err);
        return;
    }

    var client = github.client({
        username: credentials.user,
        password: credentials.password
    });

    var ghrepo = client.repo(credentials.repository);
    ghrepo.issue({
        "title": data.form.title,
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

function getLabels(data) {
    var labels = _.union(['Needs validation'], _.intersection(['bug', 'idea', 'content'], [data.type]));
    return _.uniq(labels);
}


function getDescription(data, agent, referer) {
    //add contact type
    var contact = data.form.contact;
    if (contact && !contact.match(/[@\s]/gi)) { //if defined and not containing @ or spaces then assume it is a github username
        data.__contact = '@' + contact;
    } else {
        data.__contact = contact;
    }

    //add agent info
    data.__agent = agent.toString();

    data.__referer = referer;

    var res = nunjucks.renderString(issueTemplateString, data);
    return res;
}


