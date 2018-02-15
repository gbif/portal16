"use strict";

/**
 * We are starting to see spam on the website. So far it isn't from robots, but from flesh and blood spammers that register manually, confirm email and then start posting nonsense.
 * Ideally we integrate with one of the many services to detect spam and where we can also report spam accounts and content.
 *
 * For now we simply strip links (hopefully making it less atrractive) and mark as spam based on our own list of keywords.
 */

 let urlHelper = require('./urlHelper'),
    _ = require('lodash'),
    User = require('../../../controllers/api/user/user.model'),
    log = rootRequire('config/log'),
    moment = require("moment"),
    spamTerms = rootRequire('config/spamTerms');

 let terms = spamTerms.map(function(e){return e.toLowerCase()});

module.exports = {
    isSpam: isSpam
};

function isSpam(message) {
    let referer = _.get(message, 'req.headers.referer'),
        user = _.get(message, 'req.user'),
        userName = _.get(message, 'req.user.userName'),
        spamDate = _.get(user, 'systemSettings["spam.date"]'),
        recentSpammer = spamDate && moment().subtract(7, 'days').isBefore(spamDate);

    let spam = testSpam(message);
    if (spam) {
        addSpamDateToUser(user);
        return true;
    } else if(recentSpammer) {
        log.info({module: 'spam', username: userName, referer: referer, title: message.title, text: message.text, reason: 'has spammed recently'});
        return true;
    } else {
       return false;
    }
}

function testSpam(message) {
    let referer = _.get(message, 'req.headers.referer'),
        userName = _.get(message, 'req.user.userName');

    //test that sensible referer
    if (!_.isString(referer) || (!/^http(s)?:\/\/www\.gbif((-dev)|(-uat))?\.org/.test(referer)) && !referer.startsWith('http://localhost:')) {
        log.info({module: 'spam', username: userName, referer: referer, title: message.title, text: message.text, reason: 'invalid referer'});
        return true;
    }

    //test that the content doesn't include blacklisted terms
    for (let i = 0; i < terms.length; i++) {
        let term = terms[i];
        if (testTerm(message.text, term) || testTerm(message.title, term)) {
            log.info({module: 'spam', username: userName, referer: referer, title: message.title, text: message.text, reason: 'text or title considered spam'});
            return true;
        }
        if (urlHelper.hasDuplicateLinks(message.text, {}, 3)) {
            log.info({module: 'spam', username: userName, referer: referer, title: message.title, text: message.text, reason: 'duplicate links'});
            return true;
        }
    }

    return false;
}

function testTerm(str, term) {
    return str.toLowerCase().replace(/[.,'"`:;*_\-]/g, '').replace(/\s\s+/g, ' ').indexOf(term) >= 0
}

function addSpamDateToUser(user) {
    if (user) {
        let isodate = new Date().toISOString();
        _.set(user, 'systemSettings["spam.date"]', isodate);
        User.update(user.userName, user);
    }
}