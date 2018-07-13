'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    griisPublisherKey = rootRequire('config/config').publicConstantKeys.publisher.GRIIS,
    request = require('requestretry'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    log = require('../../../../../config/log');

module.exports = function(app) {
    app.use('/api', router);
};


// router.get('/species/:key/combinations', getCombinations);

router.get('/species/:key/combinations', function(req, res) {
    let baseRequest = {
        url: apiConfig.taxon.url + req.params.key + '/combinations',
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };
    return request(baseRequest)
        .then(function(response) {
            return res.status(200).json(response.body);
        })
        .catch(function(err) {
            log.error(err);
            let status = err.statusCode || 500;
            res.sendStatus(status);
           // res.send(err);
        });
});

router.get('/species/:key/typeSpecimens', function(req, res) {
    let baseRequest = {
        url: apiConfig.taxon.url + req.params.key + '/typeSpecimens',
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };
    return request(baseRequest)
        .then(function(response) {
            return res.status(200).json(response.body);
        })
        .catch(function(err) {
            log.error(err);
            let status = err.statusCode || 500;
            res.sendStatus(status);
        });
});

router.get('/species/:key/occurencedatasets', function(req, res) {
    let limit = parseInt(req.query.limit) || 20;
    let offset = parseInt(req.query.offset) || 0;

    let baseRequest = {
        url: apiConfig.occurrence.url + 'counts/datasets?nubKey=' + req.params.key,
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let arr;

    return request(baseRequest)
        .then(function(response) {
            if (parseInt(response.statusCode !== 200)) {
                throw response;
            }


            let counts = response.body;
            arr = _.map(counts, function(val, key) {
                return {datasetKey: key, count: val};
            });
            let sliced = arr.slice(offset, Math.min((offset + limit), arr.length));
            let promises = [];

            sliced.forEach(function(e) {
                promises.push(request({
                        url: apiConfig.dataset.url + e.datasetKey,
                    timeout: 30000,
                    method: 'GET',
                    json: true
                    })
                        .then(function(r) {
                            e._dataset = r.body;
                            return e;
                        })

                );
            });

            return Q.all(promises);
        })
        .then(function() {
            let data = {
                offset: offset,
                limit: limit,
                count: arr.length,
                endOfRecords: arr.length <= (offset + limit),
                results: arr.slice(offset, Math.min((offset + limit), arr.length))
            };

            return res.status(200).json(data);
        })
        .catch(function(err) {
            log.error(err);
            let status = err.statusCode || 500;
            res.sendStatus(status);
        });
});

router.get('/species/:key/checklistdatasets', function(req, res) {
    let limit = parseInt(req.query.limit) || 20;
    let offset = parseInt(req.query.offset) || 0;

    let baseRequest = {
        url: apiConfig.dataset.url + 'search?taxonKey=' + req.params.key + '&type=CHECKLIST' + '&limit=' + limit + '&offset=' + offset,
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let result;

    return request(baseRequest)
        .then(function(response) {
            result = response;


            if (parseInt(response.statusCode !== 200)) {
                throw response;
            }

            let promises = [];

            response.body.results.forEach(function(e) {
                promises.push(
                    request({
                        url: apiConfig.taxon.url + req.params.key + '/related?datasetKey=' + e.key,
                        timeout: 30000,
                        method: 'GET',
                        json: true
                        })

                        .then(function(r) {
                            let species = r.body.results;
                            if (species.length > 0) {
                                e._relatedTaxon = species[0];
                            }
                            return e;
                        })

                    );
            });

            return Q.all(promises);
        })
        .then(function() {
            return res.status(200).json(result.body);
        })
        .catch(function(err) {
            log.error(err);
            let status = err.statusCode || 500;
            res.sendStatus(status);
        });
});

router.get('/species/:key/invadedCountries', function(req, res) {
    let limit = 500; // get all countries in the world and hope that this publisher only publish one per country and not not invasives
    let offset = 0;

    let baseRequest = {
        url: apiConfig.dataset.url + 'search?taxonKey=' + req.params.key + '&type=CHECKLIST' + '&limit=' + limit + '&offset=' + offset + '&publishingOrg=' + griisPublisherKey,
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };

    return request(baseRequest)
        .then(function(response) {
            if (parseInt(response.statusCode !== 200)) {
                throw response;
            }

            // iterate through datasets to look up species related species
            let promises = [];
            response.body.results.forEach(function(e) {
                promises.push(getInvasiveSpeciesInfo(req.params.key, e));
            });

            return Q.all(promises);
        })
        .then(function(results) {
            results = _.filter(results, _.identity);
            return res.json({
                results: results,
                count: results.length,
                endOfRecords: results.length < limit
            });
        })
        .catch(function(err) {
            log.error(err);
            let status = err.statusCode || 500;
            res.sendStatus(status);
        });
});

async function getInvasiveSpeciesInfo(taxonKey, dataset) {
    // get species from this dataset that is related to this taxonkey
    let related = await request({
        url: apiConfig.taxon.url + taxonKey + '/related?datasetKey=' + dataset.key,
        timeout: 30000,
        method: 'GET',
        json: true
        }
    );
    if (related.statusCode !== 200) {
        throw related;
    }

    // if there is any related species, then there is invasive species listed in that dataset (assuming the provided dataset is listing invasive species)
    let species = related.body.results;
    // extract country from keyword
    dataset.keywords = dataset.keywords || [];
    let invadedCountry = dataset.keywords.find(function(keyword) {
        return keyword.startsWith('country_');
    });
    if (species.length > 0 && invadedCountry) {
        let isSubCountry = invadedCountry.length > 10;
        invadedCountry = invadedCountry.substring(8, 10).toUpperCase();
        // compose result obj with the properties we need for displaying the list - no need to send full species and dataaset obj.
        return {
            invadedCountry: invadedCountry,
            isSubCountry: isSubCountry,
            datasetKey: dataset.key,
            dataset: dataset.title,
            scientificName: species[0].scientificName,
            nubKey: species[0].nubKey,
            taxonKey: species[0].key
        };
    } else {
        return undefined; // TODO ask thomas why he returns this above - i don't see how this would ever be the case
    }
}


