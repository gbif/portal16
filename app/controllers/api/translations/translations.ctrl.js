"use strict";
/**
 * Looks at the query parameter lang and returns the corresponding translation file.json to be used in the client.
 */
var express = require('express'),
    router = express.Router(),
    en = require('../../../../locales/server/en.json'),
    da = require('../../../../locales/server/da.json');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/translation.json', function (req, res, next) {
    var lang = req.query.lang;
    if (lang == 'en') {
        res.json(en);
    } else if (lang == 'da') {
        res.json(da);
    } else {
        res.json(en);
    }
});
