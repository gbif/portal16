"use strict";
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    format = rootRequire('app/helpers/format'),
    backboneDatasetKey = rootRequire('config/config').backboneDatasetKey,
    resourceSearch = require('../resource/search/resourceSearch'),
    Dataset = require('./dataset'),
    Species = require('./species'),
    SpeciesMatch = require('./speciesMatches'),
    Publisher = require('./publisher'),
    Country = require('./countrySearch');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/omniSearch', function (req, res) {
    let query = req.query.q,
        preferedLocale = req.query.locale;

    search(query, preferedLocale, res.__)
        .then(function(result){
            res.json(result);
        })
        .catch(function(){
            res.status(500);
            res.send('SERVER FAILURE');
        });
});

async function search(query, preferedLocale, __){
    let datasets = Dataset.query({q:query, limit:3});
    let publishers = Publisher.query({q:query, limit:3});
    let species = Species.query({q:query, datasetKey: backboneDatasetKey, limit:3});
    let speciesMatches = SpeciesMatch.query({name:query, verbose:true});
    let resources = resourceSearch.search({q:query, local: preferedLocale, limit:4}, __);
    let country = Country.query(query);

    let values = await Promise.all([speciesMatches, species, datasets, publishers, resources, country]);
    let response = {
        speciesMatches: values[0],
        species: values[1],
        datasets: values[2],
        publishers: values[3],
        resources: values[4],
        country: values[5]
    };
    response.species.results = pruneDuplicateSpecies(response.speciesMatches, response.species.results);
    transformMatches(response.speciesMatches);
    response.species.results = _.slice(_.concat(response.speciesMatches, response.species.results), 0, 3);
    addTypes(response);
    // addSearchFieldsToAll(response);

    format.sanitizeArrayField(response.datasets.results, 'description');
    return response;
}

function pruneDuplicateSpecies(matches, species) {
    let matchIds = _.map(matches, 'usageKey');
    return _.filter(species, function(e){
        return !_.includes(matchIds, e.key);
    });
}

function addTypes(response){
    addType(response.speciesMatches, 'species');
    addType(response.species.results, 'species');
    addType(response.datasets.results, 'dataset');
    addType(response.publishers.results, 'publisher');
    addType(response.resources.results, 'resource');
}

function addType(results, type) {
    results.forEach(function(e){
        e._type = type;
    });
}

function transformMatches(speciesMatches) {
    speciesMatches.forEach(function(e){
        e.key = e.usageKey;
        e.taxonomicStatus = e.status;
    });
}

function hasKeywordMatch(item, q) {

}

