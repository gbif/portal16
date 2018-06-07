'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryActivityCtrl', countryActivityCtrl);

/** @ngInject */
function countryActivityCtrl($http, OccurrenceTableSearch) {
    var vm = this;
    vm.aboutCountries = {};
    vm.fromCountries = {};
    vm.largestDatasetsAbout = {};
    vm.largestDatasetsFrom = {};
    vm.kingdomsAbout = {};
    vm.kingdomsFrom = {};
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
    vm.showAbout = true;
    vm.countryCode = gb.countryCode;
    vm.mapOptions = {
        points: true
    };

    vm.init = function() {
        getCoveredCountries();
        getDatasets();
        getKingdomBreakdown();
    };
    function getCoveredCountries() {
        $http.get('/api/count/country/' + vm.countryCode + '/from/countries').then(function(response) {
            vm.fromCountries = response.data;
        });
        $http.get('/api/count/country/' + vm.countryCode + '/about/countries').then(function(response) {
            vm.aboutCountries = response.data;
        });
    }

    function getDatasets() {
        $http.get('/api/occurrence/search?facet=dataset_key&limit=0&country=' + vm.countryCode).then(function(response) {
            vm.largestDatasetsAbout = response.data.facets.DATASET_KEY.counts;
        });
        $http.get('/api/occurrence/search?facet=dataset_key&limit=0&publishingCountry=' + vm.countryCode).then(function(response) {
            vm.largestDatasetsFrom = response.data.facets.DATASET_KEY.counts;
        });
    }

    function getKingdomBreakdown() {
        OccurrenceTableSearch.query({
            country: vm.countryCode,
            facet: 'kingdomKey',
            limit: 0
        }, function(response) {
            vm.kingdomsAbout = response.facets.KINGDOM_KEY.counts;
        }, function() {
            // TODO couldn't get the data
        });

        OccurrenceTableSearch.query({
            publishingCountry: vm.countryCode,
            facet: 'kingdomKey',
            limit: 0
        }, function(response) {
            vm.kingdomsFrom = response.facets.KINGDOM_KEY.counts;
        }, function() {
            // TODO couldn't get the data
        });
    }
    vm.init();
}

module.exports = countryActivityCtrl;
