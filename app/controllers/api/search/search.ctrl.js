'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    format = rootRequire('app/helpers/format'),
    backboneDatasetKey = rootRequire('config/config').publicConstantKeys.dataset.backbone,
    resourceSearch = require('../resource/search/resourceSearch'),
    Dataset = require('./datasetSearch'),
    Species = require('./species'),
    SpeciesMatch = require('./speciesMatches'),
    Publisher = require('./publisher'),
    Participant = require('./participant'),
    Country = require('./countrySearch');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/omniSearch', function(req, res) {
    let query = req.query.q || '',
        preferedLocale = req.query.locale || 'en';

    search(query, preferedLocale, res.__)
        .then(function(result) {
            res.json(result);
        })
        .catch(function(err) {
            res.status(500);
            res.send('SERVER FAILURE');
            console.log(err);
        });
});

async function search(query, preferedLocale, __) {
    query = _.isString(query) ? query.toLowerCase() : query;
    let datasets = Dataset.query({q: query, limit: 3, hl: true});
    let publishers = Publisher.query({q: query, limit: 3});
    let participants = Participant.query(query);
    let species = Species.query({q: query, datasetKey: backboneDatasetKey, limit: 3, hl: true});
    let speciesMatches = SpeciesMatch.query({name: query, verbose: true, hl: true});
    let resources = resourceSearch.search({q: query, searchable: true, local: preferedLocale, limit: 10}, __);
    let resourceHighlights = resourceSearch.search(
        {
            keywords: query,
            contentType: ['dataUse', 'event', 'news', 'project', 'programme', 'tool', 'article', 'document'],
            local: preferedLocale, limit: 2
            }, __);
    let country = Country.query(query, preferedLocale);

    let values = await Promise.all([speciesMatches, species, datasets, publishers, resources, country, resourceHighlights, participants]);
    let response = {
        speciesMatches: values[0],
        species: values[1],
        datasets: values[2],
        publishers: values[3],
        resources: values[4],
        country: values[5],
        resourceHighlights: values[6],
        participants: values[7]

    };

    response.species.results = pruneDuplicateSpecies(response.speciesMatches, response.species.results);
    response.speciesMatches = transformMatches(response.speciesMatches);
    // response.species.results = _.slice(_.concat(response.speciesMatches.results, response.species.results), 0, 3);
    addTypes(response);

    pruneDuplicateResources(response.resources, response.resourceHighlights);
    // addSearchFieldsToAll(response);

    format.sanitizeArrayField(response.datasets.results, 'description');
    return response;
}

function pruneDuplicateSpecies(matches, species) {
    let matchIds = _.map(matches, 'usageKey');
    return _.filter(species, function(e) {
        return !_.includes(matchIds, e.key);
    });
}

function pruneDuplicateResources(otherResults, keywordResults) {
    otherResults.results = _.differenceBy(otherResults.results, keywordResults.results, 'id');
}

function addTypes(response) {
    addType(response.speciesMatches.results, 'species');
    addType(response.species.results, 'species');
    addType(response.datasets.results, 'dataset');
    addType(response.publishers.results, 'publisher');
    addType(response.resources.results, 'resource');
}

function addType(results, type) {
    results.forEach(function(e) {
        e._type = type;
    });
}

function transformMatches(speciesMatches) {
    speciesMatches.forEach(function(e) {
        e.key = e.usageKey;
        e.taxonomicStatus = e.status;
    });
    return {
        count: speciesMatches.length,
        limit: speciesMatches.length,
        offset: 0,
        results: speciesMatches
    };
}
