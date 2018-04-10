'use strict';
/**
 * Looks at the query parameter lang and returns the corresponding translation file.json to be used in the client.
 */
let express = require('express'),
    router = express.Router(),
    locales = require('../../../../config/config').locales;
let translations = {};

locales.forEach(function(locale) {
    translations[locale] = require(`../../../../locales/_build/${locale}.json`);
});

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
