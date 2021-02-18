'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    Q = require('q'),
    griisPublisherKey = rootRequire('config/config').publicConstantKeys.publisher.GRIIS,
    iucnDatasetKey = rootRequire('config/config').publicConstantKeys.dataset.iucn,
    request = rootRequire('app/helpers/request'),
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

async function getTreatment(key) {
    let species = await getSpecies(key);
    let verbatimSpecies = await getVerbatim(key);
    let images = await getSpeciesMedia(key);
    let dataset = await getDataset(species.datasetKey);
    let publisher = await getPublisher(dataset.publishingOrganizationKey);
    let treatmentCandidate = _.get(verbatimSpecies, 'extensions["http://eol.org/schema/media/Document"][0]');
    if (
        treatmentCandidate &&
        treatmentCandidate['http://purl.org/dc/terms/description'] &&
        treatmentCandidate['http://purl.org/dc/terms/contributor'] &&
        treatmentCandidate['http://purl.org/dc/terms/contributor'].indexOf('Plazi') > -1
    ) {
        let treatment = treatmentCandidate['http://purl.org/dc/terms/description'];
        let treatmentCitation = treatmentCandidate['http://purl.org/dc/terms/bibliographicCitation'];
        return {
            description: treatment,
            citation: treatmentCitation,
            species: species,
            images: images.results,
            publisherTitle: publisher.title,
            publisherHomepage: _.get(publisher, 'homepage[0]'),
            publisherKey: publisher.key,
            datasetTitle: dataset.title
        };
    }
}

// this is an ugly hack because we do not model treatments
async function getTreatments(key) {
    let limit = 1000;
    let offset = 0;

    // get datasets that deal with this taxon.
    let baseRequest = {
        url: apiConfig.dataset.url + 'search?taxonKey=' + key + '&type=CHECKLIST' + '&limit=' + limit + '&offset=' + offset,
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };
    let response = await request(baseRequest);
    if (parseInt(response.statusCode !== 200)) {
        throw response;
    }
    // filter on plazi (could be subtype TREATMENT if that was modelled)
    let plaziDatasets = _.filter(response.body.results, {'publishingOrganizationKey': '7ce8aef0-9e92-11dc-8738-b8a03c50a862'});

    // for each of these datasets look for the related species within those datasets.
    for (let i = 0; i < plaziDatasets.length; i++) {
        let e = plaziDatasets[i];
        let related = await request({
            url: apiConfig.taxon.url + key + '/related?datasetKey=' + e.key,
            timeout: 30000,
            method: 'GET',
            json: true
        });
        let species = related.body.results;

        // if that related species (which is from plazi) has a reference to plazi, then it probably has a treatment attached to it.
        e._relatedTaxon = _.find(species, function(s) {
            return s.references;
        });
        if (e._relatedTaxon) {
            e.treatment = await getTreatment(e._relatedTaxon.key);
        }
    }

    // treaments are only those related species that have links to treatment bank
    let treatments = _.filter(plaziDatasets, function(e) {
        return _.has(e, '_relatedTaxon.references');
    });

    // for each treatment lookup the verbatim (from which we use the eol extension to show treatment info)
    // and get the images for that taxon.

    return _.map(treatments, 'treatment');
}
router.get('/species/:key/treatments', function(req, res) {
    getTreatments(req.params.key)
        .then(function(treatments) {
            res.status(200).json(treatments);
        }).catch(function(err) {
            log.error(err);
            let status = err.statusCode || 500;
            res.sendStatus(status);
        });
});
router.get('/species/:key/treatment', function(req, res) {
    getTreatment(req.params.key)
        .then(function(treatment) {
            if (treatment) {
                res.status(200).json(treatment);
            } else {
                res.sendStatus(404);
            }
        }).catch(function(err) {
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
        // get verbatim species view
        let verbatimSpecies = await getVerbatim(species[0].key);
        let profiles = _.get(verbatimSpecies, 'extensions["http://rs.gbif.org/terms/1.0/SpeciesProfile"]', []);
        let invasiveInfo = _.find(profiles, function(x) {
            return x['http://rs.gbif.org/terms/1.0/isInvasive'];
        });
        let isInvasive = false;
        if (invasiveInfo) {
            isInvasive = isInvasiveString(invasiveInfo['http://rs.gbif.org/terms/1.0/isInvasive']);
        }

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
            taxonKey: species[0].key,
            isInvasive: isInvasive
        };
    } else {
        return undefined; // TODO ask thomas why he returns this above - i don't see how this would ever be the case
    }
}
router.get('/species/:key/iucnstatus', function(req, res) {
    return getIUCNStatus(req.params.key)
            .then((species) => res.send(species))
            .catch((err) => {
                if (err === 'Not found') {
                    return res.sendStatus(404);
                } else {
                    return res.send(err);
                }
            });
});

async function getIUCNStatus(taxonKey) {
    let response = await request({
        url: apiConfig.taxon.url + taxonKey + '/related?datasetKey=' + iucnDatasetKey,
        timeout: 30000,
        method: 'GET',
        json: true
        });
    if (response.statusCode !== 200) {
        throw response;
    }
    const iucnTaxon = _.get(response, 'body.results[0]');
    if (!iucnTaxon) {
        throw 'Not found';
    }
    const distributionResponse = await request({
        url: apiConfig.taxon.url + iucnTaxon.key + '/distributions',
        timeout: 30000,
        method: 'GET',
        json: true
        });
    if (distributionResponse.statusCode !== 200) {
            throw distributionResponse;
    }
    if (_.get(distributionResponse, 'body.results.length') === 0) {
        throw 'Not found';
    }
    const globalDistribution = distributionResponse.body.results.find((e) => e.locality ? e.locality.toLowerCase() === 'global' : false);
    if (!globalDistribution) {
        throw 'Not found';
    }
    return {distribution: globalDistribution, references: iucnTaxon.references};
}

async function getVerbatim(taxonKey) {
    let response = await request({url: apiConfig.taxon.url + taxonKey + '/verbatim', timeout: 30000, method: 'GET', json: true});
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function getSpecies(taxonKey) {
    let response = await request({url: apiConfig.taxon.url + taxonKey, timeout: 30000, method: 'GET', json: true});
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function getSpeciesMedia(taxonKey) {
    let response = await request({url: apiConfig.taxon.url + taxonKey + '/media?mediaType=stillImage&limit=100', timeout: 30000, method: 'GET', json: true});
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function getDataset(key) {
    let response = await request({url: apiConfig.dataset.url + key, timeout: 30000, method: 'GET', json: true});
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

async function getPublisher(key) {
    let response = await request({url: apiConfig.publisher.url + key, timeout: 30000, method: 'GET', json: true});
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

function isInvasiveString(str) {
    return str === 'invasive' || str === 'true' || str === 'yes' || str === 'Invasive' || str === 'True' || str === 'Yes';
}

