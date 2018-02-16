'use strict';
/**
 * Looks at the query parameter lang and returns the corresponding translation file.json to be used in the client.
 */
let express = require('express'),
    router = express.Router(),
    countryCodes = rootRequire('app/models/enums/basic/country');

module.exports = function(app) {
    app.use('/api', router);
};

// TODO make gneric one that uses locales to fetch and if not present fallback to english
router.get('/country/suggest.json', function(req, res) {
    let countries = countryCodes.map(function(key) {
        return {key: key, title: req.__('country.' + key)};
    });
    res.json(countries);
});
