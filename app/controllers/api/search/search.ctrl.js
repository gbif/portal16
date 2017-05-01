"use strict";
var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    backboneDatasetKey = rootRequire('config/config').backboneDatasetKey,
    resourceSearch = require('../resource/search/resourceSearch'),
    contentfulLocaleMap = rootRequire('config/config').contentfulLocaleMap,
    defaultLocale = rootRequire('config/config').defaultLocale,
    Dataset = require('./dataset'),
    Species = require('./species'),
    SpeciesMatch = require('./speciesMatches'),
    Publisher = require('./publisher');


module.exports = function (app) {
    app.use('/api', router);
};

router.get('/omniSearch', function (req, res) {
    let query = req.query.q,
        preferedLocale = req.query.locale;
    let datasets = Dataset.query({q:query});
    let publishers = Publisher.query({q:query});
    let species = Species.query({q:query, datasetKey: backboneDatasetKey});
    let speciesMatches = SpeciesMatch.query({name:query, verbose:true});
    let resources = resourceSearch.search({q:query, local: preferedLocale}, res.__);
    // search resources
    // datasets, publishers, countries, directory people,
    // species regular search and match.
    // maybe occurrences for catalog nr
    //
    // afterwards create highlights cards
    // species details, occurrences count

    Promise.all([speciesMatches, species, datasets, publishers, resources])
        .then(function(values){
            let response = {
                speciesMatches: values[0],
                species: values[1],
                datasets: values[2],
                publishers: values[3],
                resources: values[4]
            };
            response.species.results = pruneDuplicateSpecies(response.speciesMatches, response.species.results);
            addTypes(response);
            addSearchFieldsToAll(response);
            flatten(response);
            res.json(response);
        })
        .catch(function(err){
            console.log(err);
            res.status(500);
            res.send('SERVER FAILURE');
        });
});

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

function addSearchFieldsToAll(response) {
    addSearchFields(response.speciesMatches);
    addSearchFields(response.species.results);
    addSearchFields(response.datasets.results);
    addSearchFields(response.publishers.results);
    addSearchFields(response.resources.results);
}

function addSearchFields(results) {
    results.forEach(function(e){
        let summary = _.get(e, 'summary', ''),
            scientificName = _.get(e, 'scientificName', ''),
            title = _.get(e, 'title', ''),
            description = _.get(e, 'description', ''),
            body = _.get(e, 'body', '');
        e._title = scientificName + title;
        e._description = (summary + description + body).substring(0,300);
    });
}

function flatten(response) {
    let results = _.concat([], response.species.results, response.datasets.results, response.publishers.results, response.resources.results);
    response.counts = {
        species: response.species.count,
        datasets: response.datasets.count,
        publishers: response.publishers.count,
        resources: response.resources.count
    };

    delete response.species;
    delete response.datasets;
    delete response.publishers;
    delete response.resources;

    response.flat = results;
}