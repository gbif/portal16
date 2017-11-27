"use strict";
let express = require('express'),
    nunjucks = require('nunjucks'),
    github = require('octonode'),
    fs = require('fs'),
    credentials = rootRequire('config/credentials').portalFeedback,
    useragent = require('useragent'),
    feedbackContentType = require('./feedbackContentType'),
    _ = require('lodash'),
    getGeoIp = rootRequire('app/helpers/utils').getGeoIp,
    log = rootRequire('config/log'),
    feedbackHelper = require('./feedbackHelper'),
    moment = require("moment"),
    router = express.Router(),
    issueTemplateString = fs.readFileSync(__dirname + '/issue.nunjucks', "utf8");

module.exports = function (app) {
    app.use('/api/feedback', router);
};

router.get('/issues', function (req, res) {
    let queryItem = req.query.item || req.headers.referer,
        item = feedbackHelper.extractIdentifer(queryItem),
        client = github.client({
            username: credentials.user,
            password: credentials.password
        }),
        ghsearch = client.search();

    //if no item is provided or is is the root in default language then do not show comments
    if (!item) {
        res.json({
            incomplete_results: false,
            total_count: 0,
            item: []
        });
    } else {

        //query github for issues with the extracted page identifier in the title
        ghsearch.issues({
            q: item + ' is:issue is:open label:"data content" -label:"Not public relevant" -label:"Under review" in:body+repo:' + credentials.repository,
            sort: 'created', //'reactions-+1',
            order: 'desc',
            per_page: 5
        }, function (err, data) {
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
                data.issuesUrl = 'https://github.com/' + credentials.repository + '/issues?utf8=✓&q=' + encodeURIComponent(item) + encodeURIComponent(' is:issue is:open label:"data content" -label:"Not public relevant" -label:"Under review" in:body');
                res.json(data);
            }
        });
    }
});

router.get('/issues/search', function (req, res) {
    let item = req.query.item,
        client = github.client({
            username: credentials.user,
            password: credentials.password
        }),
        ghsearch = client.search();

    //if no item is provided or is is the root in default language then do not show comments
    if (!item) {
        res.json({
            incomplete_results: false,
            total_count: 0,
            item: []
        });
    } else {

        //query github for issues with the extracted page identifier in the title
        ghsearch.issues({
            q: item + ' is:issue is:open in:body+repo:' + credentials.repository,
            sort: 'created', //'reactions-+1',
            order: 'desc',
            per_page: 5
        }, function (err, data) {
            if (err) {
                res.status(500);
                res.json();
            } else {
                //trim list of issues to send less info to the client
                data.items = _.map(data.items, function (o) {
                    return {
                        url: o.html_url,
                        title: o.title,
                        created_at: o.created_at,
                        comments: o.comments
                    }
                });
                //link to all the issues for this page item
                data.issuesUrl = 'https://github.com/' + credentials.repository + '/issues?utf8=✓&q=' + encodeURIComponent(item) + encodeURIComponent(' is:issue is:open in:body');
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

router.get('/content', function (req, res) {
    let path = req.query.path;
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
        ip,
        country,
        description = '',
        title,
        labels = [];

    try {
        ip = req.clientIp;
        country = _.get(getGeoIp(ip), 'country.iso_code');
        description = getDescription(data, agent, referer);
        title = getTitle(data.form.title, data.type, referer);
        labels = getLabels(data, country);
    } catch (err) {
        cb(err);
        return;
    }

    var client = github.client({
        username: credentials.user,
        password: credentials.password
    });

    var issueData = {
        title: title,
        body: description,
        labels: labels
    };

    var ghrepo = client.repo(credentials.repository);
    ghrepo.issue(issueData, function (err, data) {
        if (err) {
            cb(err);
        } else {
            cb(null, data);
        }
    });
}

function getTitle(title) {
    return title;
}

function getLabels(data, country) {
    var labels = _.union(['Under review'], _.intersection(['bug', 'idea', 'content', 'question'], [data.type]));
    if ( (data.type == 'question' || data.type == 'content') && country) {
        labels.push(country);
    }
    return _.uniq(labels);
}


function getDescription(data, agent, referer) {
    //add contact type
    let contact = data.form.contact,
        now = moment();

    if (contact && !contact.match(/[@\s]/gi)) { //if defined and not containing @ or spaces then assume it is a github username
        data.__contact = '@' + contact;
    } else {
        data.__contact = contact;
    }
    //data.__contact = contact; //simply use the raw value instead of prefacing with @ so that the user isn't poked in github

    //add agent info
    data.__agent = agent.toString();

    data.__referer = referer;

    data.__fbitem = feedbackHelper.extractIdentifer(referer);

    //set timestamps 5 minuttes before and 1 minute after for linking to relevant logs
    data.__timestamp = {};
    data.__timestamp.before = now.subtract(5, 'minutes').toISOString();
    data.__timestamp.after = now.add(6, 'minutes').toISOString();

    return nunjucks.renderString(issueTemplateString, data);
}


