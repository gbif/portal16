'use strict';

let express = require('express'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    request = require('requestretry'),
    _ = require('lodash'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};

router.get('/api/dataset/:datasetKey/event/:eventKey', function render(req, res, next) {
    getEvent(req.params.datasetKey, req.params.eventKey)
        .then(function(data) {
            res.send(data);
        })
        .catch(function(err) {
            res.sendStatus(err.statusCode || 500);
        });
});

router.get('/api/dataset/:datasetKey/event', function render(req, res, next) {
    getDatasetEvents(req.params.datasetKey, req.query.limit, req.query.offset)
        .then(function(data) {
            res.send(data);
        })
        .catch(function(err) {
            console.log(err);
            res.sendStatus(err.statusCode || 500);
        });
});

async function getDatasetEvents(datasetKey, limit, offset) {
    // set defaults
    offset = offset || 0;
    limit = limit || 10;
    limit++;
    // get facets
    let occurrences = await occurrenceEventSearch({datasetKey: datasetKey, limit: 0, facet: 'eventId', facetLimit: limit, facetOffset: offset});

    // expand facets with the first occurrence result to use as substitute for event information
    let results = await Promise.all(occurrences.facets[0].counts.map(function(e) {
        return getInfoAboutEvent(datasetKey, e.name);
    }));
    // decorate "events" with count and name (the later shouldn't be neccessary, but the API is strange and returns no results for things that in the facets at times)
    results.forEach(function(e, i) {
        e.occurrenceCount = occurrences.facets[0].counts[i].count;
        e.eventID = occurrences.facets[0].counts[i].name;
    });
    return {
        limit: limit - 1,
        offset: offset,
        endOfRecords: results.length < limit,
        results: results
    };
}

async function getEvent(datasetKey, eventKey) {
    let event = await getInfoAboutEvent(datasetKey, eventKey);
    if (_.isEmpty(event)) {
        throw new FakeEndpointException(404, 'Not found ' + eventKey);
    } else {
        return event;
    }
}

async function getInfoAboutEvent(datasetKey, eventKey) {
    let occurrences = await occurrenceEventSearch({datasetKey: datasetKey, eventId: eventKey, limit: 1});
    if (occurrences.count == 0) {
        return {};
    } else {
        let occurrence = occurrences.results[0];
        return {
            eventID: occurrence.eventID,
            decimalLongitude: occurrence.decimalLongitude,
            decimalLatitude: occurrence.decimalLatitude,
            footprintWKT: occurrence.footprintWKT,
            footprintSRS: occurrence.footprintSRS,
            footprintSpatialFit: occurrence.footprintSpatialFit,
            coordinateUncertaintyInMeters: occurrence.coordinateUncertaintyInMeters,
            locality: occurrence.locality,
            countryCode: occurrence.countryCode,
            eventDate: occurrence.eventDate,
            sampleSizeUnit: occurrence.sampleSizeUnit,
            eventRemarks: occurrence.eventRemarks,
            samplingEffort: occurrence.samplingEffort,
            samplingProtocol: occurrence.samplingProtocol,
            basisOfRecord: occurrence.basisOfRecord,
            occurrenceCount: occurrences.count
        };
    }
}

async function occurrenceEventSearch(query) {
    let baseRequest = {
        url: apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query),
        method: 'GET',
        json: true,
        fullResponse: true
    };
    let response = await request(baseRequest);
    if (response.statusCode != 200) {
        throw response;
    }
    return response.body;
}

function FakeEndpointException(statusCode, message) {
    this.message = message;
    this.statusCode = statusCode;
    this.name = 'endPointException';
}