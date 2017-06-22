"use strict";
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    helper = rootRequire('app/models/util/util'),
    request = require('requestretry'),
    utils = rootRequire('app/helpers/utils'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig');

module.exports = function (app) {
    app.use('/api', router);
};

//TODO: pass into API
var limit = 250;


//router.get('/species/:key/combinations', getCombinations);

router.get('/species/:key/combinations', function (req, res) {

    let baseRequest = {
        url: apiConfig.taxon.url + req.params.key + '/combinations',
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };
    return request(baseRequest)
        .then(function(response){
            return res.status(200).json(response.body);

        })
        .catch(function(err){
            if (err.statusCode !== 200) {
                throw response;
            }
        });

});

router.get('/species/:key/typeSpecimens', function (req, res) {

    let baseRequest = {
        url: apiConfig.taxon.url + req.params.key + '/typeSpecimens',
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };
    return request(baseRequest)
        .then(function(response){
            return res.status(200).json(response.body);

        })
        .catch(function(err){
            if (err.statusCode !== 200) {
                throw response;
            }
        });

});

router.get('/species/:key/verbatim', function (req, res) {

    let baseRequest = {
        url: apiConfig.taxon.url + req.params.key + '/verbatim',
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };
    return request(baseRequest)
        .then(function(response){
            return res.status(200).json(response.body);

        })
        .catch(function(err){
            if (err.statusCode !== 200) {
                throw response;
            }
        });

});






