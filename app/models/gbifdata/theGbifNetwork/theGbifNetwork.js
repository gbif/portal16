// @file This script collects information for use in /the-gbif-network landing page.

'use strict';

let helper = require('../../util/util'),
    Q = require('q'),
    fs = require('fs'),
    dataApi = require('../apiConfig'),
    translationsHelper = rootRequire('app/helpers/translationsPromise'),
    log = require('../../../../config/log');

let calls = 0;
let language;
let data = {
        global: {
            totalDatasets: 0,
            totalSpecies: 0,
            totalOccurrence: 0,
            vp: [],
            acp: [],
            oap: [],
            publishers: []
        },
        africa: {},
        asia: {},
        europe: {
            totalDatasets: 0,
            totalSpecies: 0,
            totalOccurrence: 0,
            vp: [],
            acp: [],
            oap: [],
            representatives: []
        },
        latin_america: {},
        north_america: {},
        oceania: {}
    };

let theGbifNetwork = function (record) {
    this.record = record;
};

theGbifNetwork.prototype.record = {};

theGbifNetwork.get = function(res){
    let deferred = Q.defer();
    language = res.locals.gb.locales.current;

    getIntro(language)
        .then(function(text){
            deferred.resolve(text);
        })
        .catch(function(err){
            deferred.reject(err.message + 'at line 27.');
        });

    return deferred.promise;
};

function getIntro(language) {
    let deferred = Q.defer();
    // insert intro text for each group.
    let introFile = ['theGbifNetwork/landing/'];
    translationsHelper.getTranslations(introFile, language)
        .then(function(translation){
            deferred.resolve(translation);
        })
        .catch(function(err){
            deferred.reject(err.message);
        });
    return deferred.promise;
}

/**
 * 1) Get country objects from our country enumeration.
 * 2) Decorate objects with data/dataset counts and attributes.
 * 3) Decorate objects with literature counts.
 * 4) Decorate objects with participant details.
 */
theGbifNetwork.getCountries = () => {
    let deferred = Q.defer();
    let requestUrl = dataApi.countryEnumeration.url;
    let options = {};
    genericEndpointAccess(requestUrl, options)
        .then(countries => {
            let countryTasks = [];
            countries.forEach(country => {
                countryTasks.push(getDataCount(country)
                    .then(() => {
                        return country;
                    })
                    .catch(e => {
                        log.info(e + ' at getCountries().')
                    }));
            });
            return Q.all(countryTasks)
                .then(() => {
                    return countries;
                });
        })
        .then(countries => {
            deferred.resolve(countries);
        })
        .catch(err => {
            deferred.reject(err + ' getCountries().');
        });

    return deferred.promise;
};

function getDataCount(country) {
    let countCollection = {};
    let callTasks = [];
    let calls = [
        {'name': 'checklistDatasetAbout', 'urlTemplate': dataApi.dataset.url  + 'search?limit=10000&type=CHECKLIST&country='},
        {'name': 'checklistDatasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&type=CHECKLIST&publishingCountry='},
        {'name': 'datasetAbout', 'urlTemplate': dataApi.occurrence.url + 'counts/datasets?country='}, // return an object list of {[uuid]: count}{'name': 'datasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&publishingCountry='},
        {'name': 'datasetFrom', 'urlTemplate': dataApi.dataset.url + '/search?limit=10000&type=OCCURRENCE&publishingCountry='}, // return an object list of {[uuid]: count}{'name': 'datasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&publishingCountry='},
        {'name': 'metadataDatasetAbout', 'urlTemplate': dataApi.dataset.url  + 'search?limit=10000&type=METADATA&country='},
        {'name': 'metadataDatasetFrom', 'urlTemplate': dataApi.dataset.url + 'search?limit=10000&type=METADATA&publishingCountry='},
        {'name': 'occurrenceAbout', 'urlTemplate': dataApi.occurrence.url + 'count?country='},
        {'name': 'occurrenceFrom', 'urlTemplate': dataApi.occurrence.url + 'search?limit=0&publishingCountry='},
        {'name': 'occurrenceContributedBy', 'urlTemplate': dataApi.occurrence.url + 'counts/publishingCountries?country='}, // returns an object list of {[enumName]: count}
        {'name': 'occurrenceContributingTo', 'urlTemplate': dataApi.occurrence.url + 'counts/countries?publishingCountry='}
    ];
    calls.forEach(call => {
        callTasks.push(genericEndpointAccess(call.urlTemplate + country.iso2)
            .then(result => {
                return processCountResult(call.name, result);
            })
            .then(countObj => {
                if (countObj.hasOwnProperty('recordCount')) {
                    countCollection[call.name + 'RecordCount'] = countObj.recordCount;
                }
                countCollection[call.name + 'Count'] = countObj.count;
            })
            .catch(e => {
                log.info(e + ' at getDataCount().')
            }));
    });
    return Q.all(callTasks)
        .then(() => {
            country.counts = countCollection;
        });
}

function processCountResult(name, result) {
    let deferred = Q.defer();
    let countObj = {};
    if (result.hasOwnProperty('count')) countObj.count = result.count;
    if (['checklistDatasetAbout', 'checklistDatasetFrom'].indexOf(name) !== -1) {
        return getChecklistMetrics(result.results)
            .then(usageCount => {
                countObj.recordCount = usageCount;
                return countObj;
            });
    }
    else if (['datasetAbout', 'occurrenceContributedBy', 'occurrenceContributingTo'].indexOf(name) !== -1) {
        let recordCount = 0;
        for (let property in result) {
            if (result.hasOwnProperty(property)) {
                recordCount += result[property];
            }
        }
        countObj.count = Object.keys(result).length;
        countObj.recordCount = recordCount;
        deferred.resolve(countObj);
    }
    else if (!isNaN(result)) {
        countObj.count = result;
        deferred.resolve(countObj);
    }
    else {
        deferred.resolve(countObj);
    }
    return deferred.promise;
}

function getChecklistMetrics(results) {
    let usagesCount = 0;
    let metricsTask = [];
    results.forEach(result => {
        metricsTask.push(genericEndpointAccess(dataApi.dataset.url + result.key + '/metrics')
            .then(metrics => {
                usagesCount += metrics.usagesCount;
            })
            .catch(e => {
                log.info(e + ' at getChecklistMetrics().')
            }));
    });
    return Q.all(metricsTask)
        .then(() => {
            return usagesCount;
        });
}

function getParticipantSummary(participant) {
    let summary = {
        headOfDelegation: {},
        nodeManager: {},
        numEndorsedPublishers: 0,
        numOccDatasets: 0,
        numOccRecords: 0,
        numChecklistDatasets: 0,
        numChecklistRecords: 0,
        numSampleDatasets: 0,
        numSampleRecords: 0,
        numMetaDatasets: 0,
        numCoveringCountries: 0,
        numPublications: 0
    };
}

function genericEndpointAccess(requestUrl, options) {

    let deferred = Q.defer();
    helper.getApiData(requestUrl, function (err, data) {
        calls++;
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(new Error(err));
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error(err + ' while accessing ' + requestUrl));
            log.info(err + ' while accessing ' + requestUrl);
        }
    }, options);
    return deferred.promise;
}

function authorizeApiCall(requestUrl) {
    let credential = require('/etc/portal16/credentials.json');

    let appKey = credential.directory.appKey;
    let secret = credential.directory.secret;

    let options = {
        url: requestUrl,
        retries: 5,
        method: 'GET',
        headers: {
            'x-gbif-user': appKey,
            'x-url': requestUrl
        }
    };

    let stringToSign = options.method + '\n' + requestUrl + '\n' + appKey;
    let signature = crypto.createHmac('sha1', secret).update(stringToSign).digest('base64');
    options.headers.Authorization = 'GBIF' + ' ' + appKey + ':' + signature;
    return options;
}

module.exports = theGbifNetwork;