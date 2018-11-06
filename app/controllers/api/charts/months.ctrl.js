'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    request = rootRequire('app/helpers/request'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring');

module.exports = function(app) {
    app.use('/api/chart', router);
};

router.get('/months', function(req, res) {
    let query = req.query;
    Promise.all([getInterval(-90, 0, query), getInterval(0, 90, query)])
        .then(function(values) {
            res.json({
                values: values
            });
        })
        .catch(function(err) {
            res.status(500);
            res.json(err);
        });
});

async function getInterval(start, end, query) {
    let options = {
        url: apiConfig.occurrenceSearch.url + '?facet=month&facetLimit=12&limit=0&decimalLatitude=' + start + ',' + end + '&' + querystring.stringify(query),
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    let months = _.range(0, 12, 1);
    return months.map(function(e) {
        return _.find(response.body.facets[0].counts, ['name', e + '']) || 0;
    });
}
