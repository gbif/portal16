'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('countryKeyCtrl', countryKeyCtrl);

/** @ngInject */
function countryKeyCtrl(OccurrenceSearch, $location, $rootScope, $stateParams, $state) {
    var vm = this;
    vm.countryCode = gb.countryCode;
    vm.isParticipant = gb.isParticipant;
    vm.countryCode = $stateParams.key;
    vm.$state = $state;
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
