'use strict';
let express = require('express'),
    auth = require('../../auth/auth.service'),
    nunjucks = require('nunjucks'),
    github = require('octonode'),
    encrypt = require('../../../models/verification/encrypt'),
    config = rootRequire('config/config'),
    fs = require('fs'),
    credentials = rootRequire('config/credentials').portalFeedback,
    // spamHelper = require('../../../models/verification/spam/spam'),
    useragent = require('useragent'),
    feedbackContentType = require('./feedbackContentType'),
    _ = require('lodash'),
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
    // We haven't seen any spam for ages, but we have had one example where valid content was rejected. Disable until spam becomes an issue again.
    // } else if (isSpam(req, formData)) {
    //     res.status(500);
    //     res.json({
    //         error: 'unable to post feedback'
    //     });
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

// function isSpam(req, formData) {
//     let message = {
//         req: req,
//         text: formData.description || '',
//         title: formData.title
//     };
//     if (spamHelper.isSpam(message)) {
//         return true;
//     }
//     return false;
// }

function createIssue(req, data, cb) {
    let agent = useragent.parse(req.headers['user-agent']),
        referer = data.location || req.headers.referer,
        description = '',
        title,
        labels = [];

    let user = encrypt.encryptJSON({
        userName: req.user.userName,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        date: new Date()
    });
    let githubUserName = _.get(req.user, 'systemSettings["auth.github.username"]');

    try {
        if (typeof getStatus == 'function') {
            data._health = _.get(getStatus(), 'severity');
        }
        description = getDescription(data, agent, referer, user, githubUserName);
        title = getTitle(data.form.title, data.type, referer);
        labels = getLabels(data);
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

function getLabels(data) {
    let labels = _.union(['Under review'], _.intersection(['bug', 'idea', 'content', 'data content', 'question'], [data.type]));
    if (data.publishingCountry) {
        labels.push(data.publishingCountry);
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

router.get('/user/mailto/:user', auth.isAuthenticated(), function(req, res) {
  auth.setNoCache(res);
  if (!req.user.email.endsWith('@gbif.org')) {
      res.sendStatus(403); // this test doesn't matter much as the registry requires a login to show the data anyhow
  } else {
      let userCode = req.params.user;
      try {
          let referer = req.headers.referer;
          if (!referer) {
            res.status(500);
            res.send('No referer present. Perhaps you copy pasted the link or opened it in a new tab.');
          }
          let issueNr = referer.substring(referer.lastIndexOf('/') + 1);
          let user = encrypt.decryptJSON(userCode);
          let body = `There has been activity on the message you logged via the GBIF feedback system: ${referer}
          
          You need a Github account to participate in the discussion.
          Did you know you can link your Github user profile to GBIF?
          
          Thanks,
          GBIF Helpdesk`;
          res.redirect(302, 'mailto:' + user.email + '?subject=GBIF Feedback system - ticket ' + issueNr + '&body=' + encodeURIComponent(body));
      } catch (err) {
          res.sendStatus(500);
      }
  }
});

