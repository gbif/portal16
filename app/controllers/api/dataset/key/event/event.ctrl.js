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
            res.json(data);
        })
        .catch(function(err) {
            res.sendStatus(err.statusCode || 500);
        });
});

router.get('/api/dataset/:datasetKey/eventCount', function render(req, res) {
    let limit = 1001;
    let q = {datasetKey: req.params.datasetKey, limit: 0, facet: 'eventId', facetLimit: limit};
    if (req.query.parentEventID) {
        q.parentEventID = req.query.parentEventID;
    }
    occurrenceEventSearch(q)
        .then(function(data) {
            data.facets[0] = data.facets[0] || {counts: []}; // only neccessary because api isn't in prod
            res.json({
                count: Math.min(limit - 1, data.facets[0].counts.length),
                endOfRecords: data.facets[0].counts.length < limit
            });
        })
        .catch(function(err) {
            res.sendStatus(err.statusCode || 500);
        });
});

router.get('/api/dataset/:datasetKey/event', function render(req, res, next) {
    getDatasetEvents(req.params.datasetKey, req.query.limit, req.query.offset, req.query.parentEventID)
        .then(function(data) {
            res.json(data);
        })
        .catch(function(err) {
            res.sendStatus(err.statusCode || 500);
        });
});

async function getDatasetEvents(datasetKey, limit, offset, optParentEventID) {
    // set defaults
    offset = _.toInteger(offset);
    limit = _.toInteger(limit) || 10;
    limit++;
    // get facets
    let q = {datasetKey: datasetKey, limit: 0, facet: 'eventId', facetLimit: limit, facetOffset: offset};
    if (optParentEventID) {
        q.parentEventID = optParentEventID;
    }
    let occurrences = await occurrenceEventSearch(q);

    // expand facets with the first occurrence result to use as substitute for event information
    occurrences.facets[0] = occurrences.facets[0] || {counts: []}; // only neccessary because api isn't in prod
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
    let dataset = await getDataset(datasetKey);
    let publisher = await getPublisher(dataset.publishingOrganizationKey);
    if (_.isEmpty(event)) {
        throw new FakeEndpointException(404, 'Not found ' + eventKey);
    } else {
        event.dataset = dataset.title;
        event.datasetKey = datasetKey;
        event.publisher = publisher.title;
        event.publishingOrganizationKey = dataset.publishingOrganizationKey;
        event.samplingDescription = dataset.samplingDescription;
        return event;
    }
}

async function getInfoAboutEvent(datasetKey, eventKey) {
    let occurrences = await occurrenceEventSearch({datasetKey: datasetKey, eventId: eventKey, limit: 1});
    if (occurrences.count == 0) {
        return {}; // it should be possible simply to return a 404 error here, but the API is bugged at this point and will return zero results despite the same eventID having a facet count.
    } else {
        let occurrence = occurrences.results[0];
        return {
            eventID: occurrence.eventID,
            parentEventID: occurrence.parentEventID,
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

async function getDataset(key) {
    let baseRequest = {
        url: apiConfig.dataset.url + key,
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

async function getPublisher(key) {
    let baseRequest = {
        url: apiConfig.publisher.url + key,
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
