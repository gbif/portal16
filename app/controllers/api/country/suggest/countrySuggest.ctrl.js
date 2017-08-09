"use strict";
/**
 * Looks at the query parameter lang and returns the corresponding translation file.json to be used in the client.
 */
var express = require('express'),
    router = express.Router(),
    countryCodes = rootRequire('app/models/enums/basic/country'),
    en = require('../../../../../locales/server/en.json'),
    da = require('../../../../../locales/server/da.json');

module.exports = function (app) {
    app.use('/api', router);
};

//TODO make gneric one that uses locales to fetch and if not present fallback to english
router.get('/country/suggest.json', function (req, res) {
    //var lang = req.query.lang;
    //var countrySuggestions = [];
    //if (lang == 'en') {
    //    countrySuggestions = getSuggestions(en.country);
    //} else if (lang == 'da') {
    //    countrySuggestions = getSuggestions(da.country);
    //} else {
    //    countrySuggestions = getSuggestions(en.country);
    //}
    //res.json(countrySuggestions);
    let countries = countryCodes.map(function(key){
        return {key: key, title: req.__('country.' + key)};
    });
    res.json(countries);
});

//function getSuggestions(translations) {
//    return Object.keys(translations).map(function (countryCode) {
//        return {
//            key: countryCode,
//            title: translations[countryCode]
//        };
//    });
//}