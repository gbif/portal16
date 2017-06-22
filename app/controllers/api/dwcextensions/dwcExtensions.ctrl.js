"use strict";
var express = require('express'),
    router = express.Router(),
    request = require('requestretry'),
    utils = rootRequire('app/helpers/utils'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig');


module.exports = function (app) {
    app.use('/api', router);
};




//router.get('/species/:key/combinations', getCombinations);

router.get('/dwc/extensions/', function (req, res) {

    let baseRequest = {
        url: apiConfig.dwcextensions.url,
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };
    return request(baseRequest)
        .then(function(response){
            var extensions = response.body.extensions;

            var mapped = {};

            for (var i=0; i < extensions.length; i++){

                mapped[extensions[i].identifier] = extensions[i];

            }
            return res.status(200).json(mapped);

        })
        .catch(function(err){
            if (err.statusCode !== 200) {
                throw err;
            }
        });

});







