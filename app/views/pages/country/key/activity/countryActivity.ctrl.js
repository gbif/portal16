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
    vm.showAbout = true;
    vm.countryCode = gb.countryCode;

    vm.init = function () {
        getCoveredCountries();
        getDatasets();
        getKingdomBreakdown();
    };
    function getCoveredCountries() {
        $http.get('/api/count/country/' + vm.countryCode + '/from/countries').then(function (response) {
            vm.fromCountries = response.data;
        });
        $http.get('/api/count/country/' + vm.countryCode + '/about/countries').then(function (response) {
            vm.aboutCountries = response.data;
        });
    }

    function getDatasets() {
        $http.get('/api/occurrence/search?facet=dataset_key&limit=0&country=' + vm.countryCode).then(function (response) {
            vm.largestDatasetsAbout = response.data.facets.DATASET_KEY.counts;
        });
        $http.get('/api/occurrence/search?facet=dataset_key&limit=0&publishingCountry=' + vm.countryCode).then(function (response) {
            vm.largestDatasetsFrom = response.data.facets.DATASET_KEY.counts;
        });
    }

    function getKingdomBreakdown() {
        OccurrenceTableSearch.query({
            country: vm.countryCode,
            facet: 'kingdomKey',
            limit: 0
        }, function (response) {
            vm.kingdomsAbout = response.facets.KINGDOM_KEY.counts;
        }, function () {
            //TODO couldn't get the data
        });

        OccurrenceTableSearch.query({
            publishingCountry: vm.countryCode,
            facet: 'kingdomKey',
            limit: 0
        }, function (response) {
            vm.kingdomsFrom = response.facets.KINGDOM_KEY.counts;
        }, function () {
            //TODO couldn't get the data
        });
    }
    vm.init();
}

module.exports = countryActivityCtrl;
