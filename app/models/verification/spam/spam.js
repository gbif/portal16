'use strict';

/**
 * We are starting to see spam on the website. So far it isn't from robots, but from flesh and blood spammers that register manually, confirm email and then start posting nonsense.
 * Ideally we integrate with one of the many services to detect spam and where we can also report spam accounts and content.
 *
 * For now we simply strip links (hopefully making it less atrractive) and mark as spam based on our own list of keywords. Not perfect, but so far it has turned out to work well enough.
 */
let urlHelper = require('./urlHelper');
let _ = require('lodash');
let User = require('../../../controllers/api/user/user.model');
let log = require('../../../../config/log');
let moment = require('moment');
let spamTerms = require('../../../../config/spamTerms');

let generatedTerms = generateTerms(spamTerms);
let terms = generatedTerms.terms;
let normalizedTerms = generatedTerms.normalizedTerms;

module.exports = {
    isSpam: isSpam,
    isSpammingLinks: isSpammingLinks,
    isSpamReferer: isSpamReferer,
    isSpamContent: isSpamContent,
    generateTerms: generateTerms
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
    } else if (recentSpammer) {
        log.info({
            module: 'spam',
            username: userName,
            referer: referer,
            title: message.title,
            text: message.text,
            reason: 'has spammed recently'
        });
        return true;
    } else {
        return false;
    }
}

function testSpam(message) {
    let referer = _.get(message, 'req.headers.referer'),
        userName = _.get(message, 'req.user.userName');

    // test that sensible referer
    if (isSpamReferer(referer)) {
        log.info({
            module: 'spam',
            username: userName,
            referer: referer,
            title: message.title,
            text: message.text,
            reason: 'invalid referer'
        });
        return true;
    }

    //test that there isn't duplicated links. Spam tend to have that
    if (isSpammingLinks(message.text)) {
        log.info({
            module: 'spam',
            username: userName,
            referer: referer,
            title: message.title,
            text: message.text,
            reason: 'duplicate links'
        });
        return true;
    }

    // test that the content doesn't include blacklisted terms
    if (isSpamContent(message.text, message.title, terms, normalizedTerms)) {
        log.info({
            module: 'spam',
            username: userName,
            referer: referer,
            title: message.title,
            text: message.text,
            reason: 'text or title considered spam'
        });
        return true;
    }

    return false;
}

function isSpammingLinks(str) {
    return urlHelper.hasDuplicateLinks(str, {}, 3);
}

function isSpamContent(text, title, terms, normalizedTerms) {
    let normalizedText = normalize(text);
    let normalizedTitle = normalize(title);
    for (let i = 0; i < terms.length; i++) {
        let term = terms[i];
        if (testTerm(text, term) || testTerm(title, term)) {
            return true;
        }
    }
    for (let i = 0; i < normalizedTerms.length; i++) {
        let term = normalizedTerms[i];
        if (testTerm(normalizedText, term) || testTerm(normalizedTitle, term)) {
            return true;
        }
    }
    return false;
}

function isSpamReferer(referer) {
    return !_.isString(referer) || (!/^http(s)?:\/\/www\.gbif((-dev)|(-uat))?\.org/.test(referer)) && !referer.startsWith('http://localhost:');
}

function testTerm(str, term) {
    return str.indexOf(term) >= 0;
}

function normalize(str){
    return str.toLowerCase().replace(/[.,'"`:;*_^~¨\-\s\u{0100}-\u{E007F}]/gu, '');
}

function addSpamDateToUser(user) {
    if (user) {
        let isodate = new Date().toISOString();
        _.set(user, 'systemSettings["spam.date"]', isodate);
        User.update(user.userName, user);
    }
}

function generateTerms(spamTerms) {
    let terms = Object.freeze(spamTerms.map(function (e) {
        return e.toLowerCase();
    }));
    let normalizedTerms = Object.freeze(spamTerms.map(function (e) {
        return normalize(e);
    }).filter(function(e){return e.length > 0}));
    return {terms, normalizedTerms};
}
