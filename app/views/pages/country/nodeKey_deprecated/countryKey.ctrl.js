'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryKeyCtrl', countryKeyCtrl);

/** @ngInject */
function countryKeyCtrl(OccurrenceSearch) {
    var vm = this;
    vm.countryCode = gb.countryCode;
    vm.isParticipant = gb.isParticipant;

    OccurrenceSearch.query({
        country: vm.countryCode,
        limit: 0
    }, function(data) {
        vm.countAbout = data.count;
    }, function() {
        // TODO how to handle api failures here. toast that we are seeing outages? ask user to refresh
    });

    OccurrenceSearch.query({
        publishing_country: vm.countryCode,
        limit: 0
    }, function(data) {
        vm.countPublished = data.count;
    }, function() {
        // TODO how to handle api failures here. toast that we are seeing outages? ask user to refresh
    });
}

module.exports = countryKeyCtrl;

