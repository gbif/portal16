'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryActivityCtrl', countryActivityCtrl);

/** @ngInject */
function countryActivityCtrl($http, env, $stateParams, MapCapabilities) {
    var vm = this;
    vm.countryCode = $stateParams.key;
    vm.countryCapabilities = MapCapabilities.get({country: vm.key});
    vm.publishingCountryCapabilities = MapCapabilities.get({publishingCountry: vm.countryCode});

    //deprecated metrics API, but in agreement with Tim R, it is to be used for now until we find a better solution that also performs 15/6/2017
    $http.get(env.dataApi + 'occurrence/counts/publishingCountries', {params: {country: vm.countryCode}})
        .then(function(resp){
            vm.publishingCountries = resp.data;
            vm.publishingCountriesCount = Object.keys(vm.publishingCountries).length;
        });

    $http.get(env.dataApi + 'occurrence/counts/countries', {params: {publishingCountry: vm.countryCode}})
        .then(function(resp){
            vm.countries = resp.data;
            vm.countriesCount = Object.keys(vm.countries).length;
        });

    $http.get(env.dataApi + 'occurrence/counts/datasets', {params: {country: vm.countryCode}})
        .then(function(resp){
            vm.datasets = resp.data;
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
}

module.exports = countryActivityCtrl;
