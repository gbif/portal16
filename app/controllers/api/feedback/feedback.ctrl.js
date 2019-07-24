'use strict';
let express = require('express'),
    auth = require('../../auth/auth.service'),
    nunjucks = require('nunjucks'),
    github = require('octonode'),
    encrypt = require('../../../models/verification/encrypt'),
    config = rootRequire('config/config'),
    fs = require('fs'),
    credentials = rootRequire('config/credentials').portalFeedback,
    spamHelper = require('../../../models/verification/spam/spam'),
    useragent = require('useragent'),
    feedbackContentType = require('./feedbackContentType'),
    _ = require('lodash'),
    getGeoIp = rootRequire('app/helpers/utils').getGeoIp,
    log = rootRequire('config/log'),
    moment = require('moment'),
    router = express.Router(),
    notificationsComplete = require('../health/notifications.model')(),
    issueTemplateString = fs.readFileSync(__dirname + '/issue.nunjucks', 'utf8');

let getStatus;
notificationsComplete
    .then(function(getStatusFunction) {
        getStatus = getStatusFunction;
    })
    .catch(function() {
        // ignore errors
    });

module.exports = function(app) {
    app.use('/api/feedback', router);
};

router.get('/template.html', function(req, res, next) {
    // once promise has been resolved then
    try {
        res.render('shared/layout/partials/feedback/feedbackDirective');
    } catch (err) {
        next(err);// TODO not ideal error handling for an angular template. What would be a better way?
    }
});

router.get('/content', function(req, res) {
    let path = req.query.path;
    feedbackContentType.getFeedbackContentType(path, function(feedbackType) {
        res.json(feedbackType);
    });
});

router.post('/bug', auth.isAuthenticated(), function(req, res) {
    let formData = req.body.form;
    if (!formData || !isValid(formData)) {
        res.status(400);
        res.json({
            error: 'form data missing'
        });
    } else if (isSpam(req, formData)) {
        res.status(500);
        res.json({
            error: 'unable to post feedback'
        });
    } else {
        createIssue(req, req.body, function(err, data) {
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

function isSpam(req, formData) {
    let message = {
        req: req,
        text: formData.description || '',
        title: formData.title
    };
    if (spamHelper.isSpam(message)) {
        return true;
    }
    return false;
}

function createIssue(req, data, cb) {
    let agent = useragent.parse(req.headers['user-agent']),
        referer = req.headers.referer,
        ip,
        country,
        description = '',
        title,
        labels = [];

    let user = encrypt.encryptJSON({
        userName: req.user.userName,
        date: new Date()
    });
    let githubUserName = _.get(req.user, 'systemSettings["auth.github.username"]');

    try {
        ip = req.clientIp;
        country = _.get(getGeoIp(ip), 'country.iso_code');
        if (typeof getStatus == 'function') {
            data._health = _.get(getStatus(), 'severity');
        }
        description = getDescription(data, agent, referer, user, githubUserName);
        title = getTitle(data.form.title, data.type, referer);
        labels = getLabels(data, country);
    } catch (err) {
        cb(err);
        return;
    }

    let client = github.client({
        username: credentials.user,
        password: credentials.password
    });

    let issueData = {
        title: title,
        body: description,
        labels: labels
    };

    let ghrepo = client.repo(credentials.repository);
    ghrepo.issue(issueData, function(err, data) {
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
    let labels = _.union(['Under review'], _.intersection(['bug', 'idea', 'content', 'data content', 'question'], [data.type]));
    if ( (data.type == 'question' || data.type == 'content') && country) {
        labels.push(country);
    }
    return _.uniq(labels);
}


function getDescription(data, agent, referer, user, githubUserName) {
    // add contact type
    let contact = data.form.contact,
        now = moment();

    if (contact && !contact.match(/[@\s]/gi)) { // if defined and not containing @ or spaces then assume it is a github username
        data.__contact = '@' + contact;
    } else {
        data.__contact = contact;
    }
    // data.__contact = contact; //simply use the raw value instead of prefacing with @ so that the user isn't poked in github

    data.__agent = agent.toString();
    data.__user = user;
    data.__githubUserName = githubUserName;
    data.__domain = config.domain;
    data.__referer = referer;

    // set timestamps 5 minuttes before and 1 minute after for linking to relevant logs
    data.__timestamp = {};
    data.__timestamp.before = now.subtract(5, 'minutes').toISOString();
    data.__timestamp.after = now.add(6, 'minutes').toISOString();

    return nunjucks.renderString(issueTemplateString, data);
}

router.get('/user/:user', auth.isAuthenticated(), function(req, res) {
    auth.setNoCache(res);
    if (!req.user.email.endsWith('@gbif.org')) {
        res.sendStatus(403); // this test doesn't matter much as the registry requires a login to show the data anyhow
    } else {
        let userCode = req.params.user;
        try {
            let user = encrypt.decryptJSON(userCode);
            res.redirect(302, config.registry + '/user/' + user.userName);
        } catch (err) {
            res.sendStatus(500);
        }
    }
});

