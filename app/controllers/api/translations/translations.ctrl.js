'use strict';
/**
 * Looks at the query parameter lang and returns the corresponding translation file.json to be used in the client.
 */
let express = require('express');
let router = express.Router();
let translations = require('./translations');
let acceptLanguageParser = require('accept-language-parser');
let auth = require('../../auth/auth.service');
let locales = require('../../../../config/config').locales;
let availableLocales = locales;

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/translation.json', function(req, res) {
    let lang = req.query.lang;
    if (typeof translations[lang] !== 'undefined') {
        res.json(translations[lang]);
    } else {
        res.json(translations.en);
    }
});

router.get('/translation/suggested', function(req, res) {
    let matchedLanguage = acceptLanguageParser.pick(availableLocales, req.headers['accept-language']);
    auth.setNoCache(res);
    res.json({matched: matchedLanguage});
});
