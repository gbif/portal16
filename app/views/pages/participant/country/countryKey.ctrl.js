'use strict';

var angular = require('angular');

require('./summary/countrySummary.ctrl');
require('./about/countryAbout.ctrl');
require('./publishing/countryPublishing.ctrl');
require('./participation/countryParticipation.ctrl');

angular
    .module('portal')
    .controller('countryKeyCtrl', countryKeyCtrl);

/** @ngInject */
function countryKeyCtrl($http, $stateParams, $state, Country, Page, $translate, env, MapCapabilities, OccurrenceCountPublishingCountries, OccurrenceCountCountries, OccurrenceCountDatasets) {
    var vm = this;
    vm.countryCode = gb.countryCode;
    vm.isParticipant = gb.isParticipant;
    vm.countryCode = $stateParams.key;
    vm.$state = $state;

    $translate('country.' + vm.countryCode).then(function (translation) {
        Page.setTitle(translation);
    });

    vm.country = Country.get({key: vm.countryCode});

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

    //
    // OccurrenceSearch.query({
    //     country: vm.countryCode,
    //     limit: 0
    // }, function (data) {
    //     vm.countAbout = data.count;
    // }, function () {
    //     //TODO how to handle api failures here. toast that we are seeing outages? ask user to refresh
    // });
    //
    // OccurrenceSearch.query({
    //     publishing_country: vm.countryCode,
    //     limit: 0
    // }, function (data) {
    //     vm.countPublished = data.count;
    // }, function () {
    //     //TODO how to handle api failures here. toast that we are seeing outages? ask user to refresh
    // });
    //
    // function updateTab() {
    //     //vm.hash = tabs.indexOf($location.hash()) > -1 ? $location.hash() : 'about';
    //     // vm.updateGrid();
    //     console.log($location.search());
    //     console.log('change detected');
    // }
    //
    // updateTab();
    //
    // $rootScope.$on('$locationChangeSuccess', function () {
    //     updateTab();
    // });
    //
    // vm.tabs = {
    //     ABOUT: undefined,
    //     ACTIVITIES: 'activities',
    //     TRENDS: 'trends'
    // };
    // vm.changeTab = function (tab) {
    //     vm.tab = tab;
    //     $location.search({tab: tab});
    // };
    //
    // vm.country;
    // $http.get('/api/country/about/' + $stateParams.key, {})
    //     .then(function(response){
    //         vm.country = response.data;
    //         var linkId = _.get(response.data, 'prose.main.fields.primaryLink.sys.id');
    //         var link = _.get(response.data, 'prose.resolved.Entry['+linkId+']');
    //         if (link) {
    //             vm.primaryLink = {
    //                 url: link.fields.url,
    //                 label: link.fields.label
    //             }
    //         } else if(response.data.node.nodeUrl) {
    //             vm.primaryLink = {
    //                 url: response.data.node.nodeUrl,
    //                 label: response.data.node.acronym || 'Node website'
    //             }
    //         }
    //     })
    //     .catch(function(err){
    //         console.log(err);
    //     });
}

module.exports = countryKeyCtrl;
