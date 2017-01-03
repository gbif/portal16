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
    feedbackHelper = require('./feedbackHelper'),
    moment = require("moment"),
    router = express.Router();

let issueTemplateString = fs.readFileSync(__dirname + '/issue.nunjucks', "utf8");


module.exports = function (app) {
    app.use('/api/feedback', router);
};

router.get('/issues', function (req, res, next) {
    var queryItem = req.query.item || req.headers.referer;
    var item = feedbackHelper.extractIdentifer(queryItem);

    //if no item is provided or is is the root in default language then do not show comments
    if (!item) {
        res.json({
            incomplete_results: false,
            total_count: 0,
            item: []
        });
    } else {

        var client = github.client({
            username: credentials.user,
            password: credentials.password
        });
        var ghsearch = client.search();

        //query github for issues with the extracted page identifier in the title
        ghsearch.issues({
            q: item + ' is:issue is:open label:content -label:"Needs validation" in:body+repo:' + credentials.repository,
            sort: 'created', //'reactions-+1',
            order: 'desc',
            per_page: 5
        }, function (err, data, headers) {
            if (err) {
                res.status(500);
                res.json();
            } else {
                //trim list of issues to send less info to the client
                data.items = _.map(data.items, function (o) {
                    return {
                        url: o.html_url,
                        title: o.title.replace(item, '').trim(),
                        created_at: o.created_at,
                        comments: o.comments
                    }
                });
                //link to all the issues for this page item
                data.issuesUrl = 'https://github.com/' + credentials.repository + '/issues?utf8=✓&q=' + encodeURIComponent(item) + encodeURIComponent(' is:issue is:open label:content -label:"Needs validation" in:body');
                res.json(data);
            }
        });
    }

});

router.get('/template.html', function (req, res, next) {
    //once promise has been resolved then
    try {
        res.render('shared/layout/partials/feedback/feedbackDirective');
    } catch (err) {
        next(err);//TODO not ideal error handling for an angular template. What would be a better way?
    }

});

router.get('/content', function (req, res, next) {
    var path = req.query.path;
    feedbackContentType.getFeedbackContentType(path, function (feedbackType) {
        res.json(feedbackType);
    });
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

function isValid(formData) {
    if (_.isEmpty(formData.title)) return false;
    return true;
}

function createIssue(req, data, cb) {
    let agent = useragent.parse(req.headers['user-agent']),
        referer = req.headers.referer,
        item = feedbackHelper.extractIdentifer(referer);
    var description = '',
        title,
        labels = [];

    try {
        description = getDescription(data, agent, referer);
        title = getTitle(data.form.title, data.type, referer);
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
        title: title,
        body: description,
        labels: labels
    }, function (err, data) {
        if (err) {
            cb(err);
        } else {
            cb(null, data);
        }
    });
}

function getTitle(title, type, referer) {
    return title;
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

    data.__fbitem = feedbackHelper.extractIdentifer(referer);

    //get timestamps
    var now = moment();

    //date math example
    data.__timestamp = {};
    data.__timestamp.before = now.subtract(5, 'minutes').toISOString();
    data.__timestamp.after = now.add(6, 'minutes').toISOString();

//time math example
    console.log(now.add(6, 'minutes').toISOString());

    var res = nunjucks.renderString(issueTemplateString, data);
    return res;
}


