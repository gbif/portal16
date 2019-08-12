'use strict';
let urlHelper = require('./urlHelper');
let _ = require('lodash');

module.exports = {
    isSpammingLinks: isSpammingLinks,
    isSpamContent: isSpamContent,
    isSpamReferer: isSpamReferer,
    normalize: normalize,
    generateTerms: generateTerms
};

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

function normalize(str) {
    return str.toLowerCase().replace(/[.,'"`:;*_^~¨\-\u{0100}-\u{E007F}]/gu, '');
}

function generateTerms(spamTerms) {
    let terms = Object.freeze(spamTerms.map(function(e) {
        return e.toLowerCase();
    }));
    let normalizedTerms = Object.freeze(spamTerms.map(function(e) {
        return normalize(e);
    }).filter(function(e) {
        return e.length > 0;
    }));
    return {terms, normalizedTerms};
}
