'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countrySummaryCtrl', countrySummaryCtrl);

/** @ngInject */
function countrySummaryCtrl($http, env, $stateParams, MapCapabilities, OccurrenceCountPublishingCountries, OccurrenceCountCountries, OccurrenceCountDatasets, Country) {
    var vm = this;
    vm.countryCode = $stateParams.key;
    vm.countryCapabilities = MapCapabilities.get({country: vm.key});
    vm.publishingCountryCapabilities = MapCapabilities.get({publishingCountry: vm.countryCode});

    vm.publishingCountries = OccurrenceCountPublishingCountries.get({country: vm.countryCode});
    vm.publishingCountries.$promise
        .then(function(){
            vm.publishingCountriesCount = Object.keys(vm.publishingCountries).length;
        });

    vm.countries = OccurrenceCountCountries.get({publishingCountry: vm.countryCode});
    vm.countries.$promise
        .then(function(){
            vm.countriesCount = Object.keys(vm.countries).length;
        });

    vm.datasets = OccurrenceCountDatasets.get({country: vm.countryCode});
    vm.datasets.$promise
        .then(function(){
            vm.datasetCount = Object.keys(vm.datasets).length;
        });

    $http.get(env.dataApi + 'occurrence/count', {params: {country: vm.countryCode}})
        .then(function(resp){
            vm.occurrenceCount = resp.data;
        });
    $http.get(env.dataApi + 'occurrence/count', {params: {publishingCountry: vm.countryCode}})
        .then(function(resp){
            vm.occurrenceFromCount = resp.data;
        });
    vm.country = Country.get({key: vm.countryCode});
}

module.exports = countrySummaryCtrl;
