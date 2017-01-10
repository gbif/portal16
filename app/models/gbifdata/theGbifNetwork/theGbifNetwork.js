// @file This script collects information for use in /the-gbif-network landing page.

'use strict';

let helper = require('../../util/util'),
    Q = require('q'),
    fs = require('fs'),
    dataApi = require('../apiConfig'),
    DirectoryParticipants = require('../directory/directoryParticipants'),
    PublisherRegional = require('../publisher/publisherRegional'),
    Literature = require('../../cmsData/literature/literature'),
    translationsHelper = rootRequire('app/helpers/translations'),
    log = require('../../../../config/log');

let calls = 0;
let language;

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
    translationsHelper.getTranslationPromise(introFile, language)
        .then(function(translation){
            deferred.resolve(translation);
        })
        .catch(function(err){
            deferred.reject(err.message);
        });
    return deferred.promise;
}

theGbifNetwork.counts = region => {
    let count = {},
        query = {},
        participantTypes = ['voting_participant', 'associate_country_participant', 'other_associate_participant'],
        tasks = [];

    if (region !== 'GLOBAL' || typeof region !== 'undefined' || region !== null) {
        query.gbifRegion = region;
    }

    query.membershipType = 'voting_participant';
    DirectoryParticipants.groupBy(query)
        .then(result => {
            count[query.membershipType] = result.length;
            query.membershipType = 'associate_country_participant';
            return DirectoryParticipants.groupBy(query);
        })
        .then(result => {
            count[query.membershipType] = result.length;
            query.membershipType = 'other_associate_participant';
            // regional publishers
            return DirectoryParticipants.groupBy(query);
        })
        .then(result => {
            count[query.membershipType] = result.length;
            return PublisherRegional.groupBy(region);
        })
        .then(publishers => {
            count['publisher'] = publishers.length;
            return Literature.groupBy(region);
        })
        .then(literatureRegional => {
            count['literature'] = literatureRegional.literature.length;
            count['literatureAuthorCountries'] = literatureRegional.countries.length;
            return count;
        })
        .catch(e => {
            log.info(e + ' at count().');
        });
};

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
    helper.getApiDataPromise(requestUrl, options)
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
        callTasks.push(helper.getApiDataPromise(call.urlTemplate + country.iso2)
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
        metricsTask.push(helper.getApiDataPromise(dataApi.dataset.url + result.key + '/metrics')
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

module.exports = theGbifNetwork;