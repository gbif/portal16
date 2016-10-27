// @file This script collects information for use in /the-gbif-network landing page.

'use strict';

var helper = require('../../util/util'),
    Q = require('q'),
    fs = require('fs'),
    dataApi = require('../apiConfig'),
    translationsHelper = rootRequire('app/helpers/translationsPromise'),
    log = require('../../../../config/log');

var calls = 0;
var language;
var data = {
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
        representatives: [],
    },
    latin_america: {},
    north_america: {},
    oceania: {}
};

var theGbifNetwork = function (record) {
    this.record = record;
};

theGbifNetwork.prototype.record = {};

theGbifNetwork.get = function(res){
    var deferred = Q.defer();
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
    var deferred = Q.defer();
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

function getParticipantSummary(participan) {
    var summary = {
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

module.exports = theGbifNetwork;