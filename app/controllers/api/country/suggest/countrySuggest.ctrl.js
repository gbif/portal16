"use strict";
/**
 * Looks at the query parameter lang and returns the corresponding translation file.json to be used in the client.
 */
var express = require('express'),
    router = express.Router(),
    en = require('../../../../../locales/server/en.json'),
    da = require('../../../../../locales/server/da.json');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/country/suggest.json', function (req, res) {
    var lang = req.query.lang;
    var countrySuggestions = [];
    if (lang == 'en') {
        countrySuggestions = getSuggestions(en.country);
    } else if (lang == 'da') {
        countrySuggestions = getSuggestions(da.country);
    } else {
        countrySuggestions = getSuggestions(en.country);
    }
    res.json(countrySuggestions);
});

function getSuggestions(translations) {
    return Object.keys(translations).map(function(countryCode){
        return {
            key: countryCode,
            title: translations[countryCode]
        };
    });
}