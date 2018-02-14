"use strict";

/**
 * We are starting to see spam on the website. So far it isn't from robots, but from flesh and blood spammers that register manually, confirm email and then start posting nonsense.
 * Ideally we integrate with one of the many services to detect spam and where we can also report spam accounts and content.
 *
 * For now we simply strip links (hopefully making it less atrractive) and mark as spam based on our own list of keywords.
 */

 let urlHelper = require('./urlHelper'),
    spamTerms = rootRequire('config/spamTerms');

 let terms = spamTerms.map(function(e){return e.toLowerCase()});

module.exports = {
    isSpam: isSpam
};

function isSpam(message) {
    for (let i = 0; i < terms.length; i++) {
        let term = terms[i];
        if (message.text.toLowerCase().indexOf(term) >= 0 || message.title.toLowerCase().indexOf(term) >= 0) {
            return true;
        }
        if (urlHelper.hasDuplicateLinks(message.text, {}, 3)) {
            return true;
        }
    }
    return false;
}