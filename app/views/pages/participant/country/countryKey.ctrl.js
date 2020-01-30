'use strict';

var angular = require('angular');

require('./summary/countrySummary.ctrl');
require('./about/countryAbout.ctrl');
require('./publishing/countryPublishing.ctrl');
require('./participation/countryParticipation.ctrl');
require('./research/countryResearch.ctrl');
require('./projects/countryProjects.ctrl');


angular
    .module('portal')
    .controller('countryKeyCtrl', countryKeyCtrl);

/** @ngInject */
// eslint-disable-next-line max-len
function countryKeyCtrl($anchorScroll, $http, $stateParams, $state, constantKeys, Country, Page, $translate, env, PublisherSearch, MapCapabilities, DatasetSearch, OccurrenceSearch, OccurrenceCountDatasets, OccurrenceTableSearch, ResourceSearch) {
    var vm = this;
    vm.countryCode = gb.countryCode;
    vm.isParticipant = gb.isParticipant;
    vm.locale = gb.locale;
    vm.countryCode = $stateParams.key;
    vm.$state = $state;
    Page.drawer(false);

    $translate('country.' + vm.countryCode).then(function(translation) {
        Page.setTitle(translation);
    });

    vm.country = Country.get({key: vm.countryCode});

    ResourceSearch.query({contractCountry: vm.countryCode, contentType: 'project', limit: 1}, function(data) {
        vm.projects = data;
    }, function() {
        // TODO handle request error
    });

    vm.countryCapabilities = MapCapabilities.get({country: vm.key});
    vm.publishingCountryCapabilities = MapCapabilities.get({publishingCountry: vm.countryCode});

    vm.publishingCountriesSearch = OccurrenceSearch.get({country: vm.countryCode, facet: 'publishing_country', facetLimit: 500});
    vm.publishingCountriesSearch.$promise
        .then(function(data) {
            vm.publishingCountries = data.facets[0].counts;
            vm.publishingCountriesCount = vm.publishingCountries.length;
        });

    vm.countriesSearch = OccurrenceSearch.get({publishingCountry: vm.countryCode, facet: 'country', facetLimit: 500});
    vm.countriesSearch.$promise
        .then(function(data) {
            vm.countries = data.facets[0].counts;
            vm.countriesCount = vm.countries.length;
        });

    vm.datasets = OccurrenceCountDatasets.get({country: vm.countryCode});
    vm.datasets.$promise
        .then(function() {
            vm.datasetCount = Object.keys(vm.datasets).length;
        });

    vm.datasetsFrom = DatasetSearch.query({publishingCountry: vm.countryCode});
    vm.publishersFrom = PublisherSearch.query({country: vm.countryCode, isEndorsed: true});

    vm.invasiveSpeciesDatasets = DatasetSearch.query({keyword: 'country_' + vm.countryCode, publishingOrg: constantKeys.publisher.GRIIS});// TODO move to hardcoded keys
    vm.invasiveSpeciesDatasets.$promise
        .then(function(data) {
            vm.invasiveDatasetLength = data.count;
        });

    $http.get(env.dataApi + 'occurrence/count', {params: {country: vm.countryCode}})
        .then(function(resp) {
            vm.occurrenceCount = resp.data;
        });
    $http.get(env.dataApi + 'occurrence/count', {params: {publishingCountry: vm.countryCode}})
        .then(function(resp) {
            vm.occurrenceFromCount = resp.data;
        });

    vm.kingdoms = [
        {id: 1, title: 'Animalia', icon: 'animalia'},
        {id: 6, title: 'Plantae', icon: 'plantae'},
        {id: 5, title: 'Fungi', icon: 'fungi'},
        {id: 2, title: 'Archaea', icon: 'archaea'},
        {id: 3, title: 'Bacteria', icon: 'bacteria'},
        {id: 4, title: 'Chromista', icon: 'chromista'},
        {id: 7, title: 'Protozoa', icon: 'protozoa'},
        {id: 8, title: 'Viruses', icon: 'viruses'},
        {id: 0, title: 'incertae sedis', icon: 'unknown'}
    ];

    OccurrenceTableSearch.query({
        'publishingCountry': vm.countryCode,
        'facet': ['kingdomKey', 'country'],
        'country.facetLimit': 999999,
        'limit': 0
    }, function(response) {
        vm.kingdomsFrom = response.facets.KINGDOM_KEY.counts;
        vm.countriesCoveredBy = Object.keys(response.facets.COUNTRY.counts).length;
        vm.occurrencesFrom = response.count;
    }, function() {
        // TODO couldn't get the data
    });

    OccurrenceTableSearch.query({
        'country': vm.countryCode,
        'facet': ['kingdomKey', 'publishingOrg'],
        'publishingOrg.facetLimit': 999999,
        'limit': 0
    }, function(response) {
        vm.kingdomsAbout = response.facets.KINGDOM_KEY.counts;
        vm.publishersAbout = Object.keys(response.facets.PUBLISHING_ORG.counts).length;
        vm.occurrencesAbout = response.count;
    }, function() {
        // TODO couldn't get the data
    });

    vm.lightbox = new Lightbox();

    vm.trendsLoaded = function() {
        window.setTimeout($anchorScroll, 500);
    };
}

module.exports = countryKeyCtrl;
