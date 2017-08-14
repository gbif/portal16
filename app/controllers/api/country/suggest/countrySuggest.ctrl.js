"use strict";
/**
 * Looks at the query parameter lang and returns the corresponding translation file.json to be used in the client.
 */
var express = require('express'),
    _ = require('lodash'),
    router = express.Router(),
    countryCodes = rootRequire('locales/server/en').country;

module.exports = function (app) {
    app.use('/api', router);
};

//TODO make gneric one that uses locales to fetch and if not present fallback to english
router.get('/country/suggest.json', function (req, res) {
    let countries = [];

     _.forEach(countryCodes, function(value, key){
         countries.push({key: key, title: req.__('country.' + key)});
    })


    res.json(countries);
});