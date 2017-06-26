"use strict";
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
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

router.get('/species/:key/occurencedatasets', function (req, res) {

    var limit = parseInt(req.query.limit) || 20;
    var offset = parseInt(req.query.offset) || 0;

    let baseRequest = {
        url: apiConfig.occurrence.url + "counts/datasets?nubKey=" + req.params.key,
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };

    var arr;

    return request(baseRequest)
        .then(function(response){


            if(parseInt(response.statusCode !== 200)){
                throw response;
            };

            var counts = response.body;
            arr = _.map(counts, function(val, key){
                return {datasetKey: key, count: val};
            });
            var sliced = arr.slice(offset, Math.min((offset + limit), arr.length));
            var promises = [];

            sliced.forEach(function(e){
                promises.push(request({
                        url:  apiConfig.dataset.url +  e.datasetKey,
                    timeout: 30000,
                    method: 'GET',
                    json: true
                    })
                        .then(function(r){


                            e._dataset = r.body;
                            return e;

                        })

                )
            });

            return Q.all(promises);

        })
        .then(function(){

            var data = {
                offset: offset,
                limit: limit,
                count: arr.length,
                endOfRecords: arr.length < (offset + limit),
                results: arr.slice(offset,  Math.min((offset + limit), arr.length))
            };

            return res.status(200).json(data);

        })
        .catch(function(err){
            if (err.statusCode !== 200) {
                try {
                    res.sendStatus(err.statusCode);
                } catch (err) {
                    res.sendStatus(500);
                }

                throw err;
            }
        });

});

router.get('/species/:key/checklistdatasets', function (req, res) {

    var limit = parseInt(req.query.limit) || 20;
    var offset = parseInt(req.query.offset) || 0;

    let baseRequest = {
        url: apiConfig.dataset.url + "search?taxonKey="+ req.params.key +"&type=CHECKLIST"+"&limit="+limit+"&offset="+offset,
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };

    var result;

    return request(baseRequest)
        .then(function(response){

            result = response;


            if(parseInt(response.statusCode !== 200)){
                throw response;
            };

            var promises = [];

            response.body.results.forEach(function(e){
                promises.push(
                    request({
                        url: apiConfig.taxon.url + req.params.key +"/related?datasetKey="+ e.key,
                        timeout: 30000,
                        method: 'GET',
                        json: true
                        })

                        .then(function(r){
                            var species = r.body.results;
                            if(species.length > 0){
                                e._relatedTaxon = species[0];
                            }
                            return e;
                        })

                    )
            })

            return Q.all(promises);

        })
        .then(function(){


            return res.status(200).json(result.body);

        })
        .catch(function(err){
            if (err.statusCode !== 200) {
                try {
                    res.sendStatus(err.statusCode);
                } catch (err) {
                    res.sendStatus(500);
                }

                throw err;
            }
        });

});








