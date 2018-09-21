'use strict';
let express = require('express');
let router = express.Router({caseSensitive: true});
let _ = require('lodash');
let request = require('requestretry');
let apiConfig = rootRequire('app/models/gbifdata/apiConfig');
let querystring = require('querystring');

module.exports = function(app) {
    app.use('/api/chart', router);
};

router.get('/latitudeDistribution', function(req, res) {
    let query = req.query;
    let range = _.range(-90, 90, 15);
    let promises = range.map(function(e) {
        return getInterval(e, e + 15, query);
    });
    Promise.all(promises)
        .then(function(values) {
            res.json({
                values: values.reverse(),
                labels: range.map(function(e) {
                    return getLatitudeText(e) + ' - ' + getLatitudeText(e + 15);
                }).reverse()
            });
        })
        .catch(function(err) {
            res.status(500);
            res.json(err);
        });
});

async function getInterval(start, end, query) {
    let options = {
        url: apiConfig.occurrenceSearch.url + '?has_geospatial_issue=false&limit=0&decimalLatitude=' + start + ',' + end + '&' + querystring.stringify(query),
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body.count;
}

function getLatitudeText(n) {
    if (n < 0) return Math.abs(n) + 'S';
    if (n > 0) return Math.abs(n) + 'N';
    return n;
}


router.get('/elevationDistribution', function(req, res) {
    let query = req.query;
    let range = _.range(0, 3000, 200);
    let promises = range.map(function(e) {
        return getElevationInterval(e, e + 100, query);
    });
    Promise.all(promises)
        .then(function(values) {
            res.json({
                values: values.reverse(),
                labels: range.map(function(e) {
                    return getElevationText(e) + ' - ' + getElevationText(e + 100);
                }).reverse()
            });
        })
        .catch(function(err) {
            res.status(500);
            res.json(err);
        });
});

async function getElevationInterval(start, end, query) {
    let options = {
        url: apiConfig.occurrenceSearch.url + '?limit=0&elevation=' + start + ',' + end + '&' + querystring.stringify(query),
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body.count;
}

function getElevationText(n) {
    return Math.abs(n) + 'm';
}
