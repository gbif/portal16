'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryResearchCtrl', countryResearchCtrl);

/** @ngInject */
function countryResearchCtrl($stateParams, ResourceSearch) {
    var vm = this;
    vm.countryCode = $stateParams.key;
    vm.limit = 20;
    vm.locale = gb.locale;
    vm.showLiteratureFrom = true;
    ResourceSearch.query({countriesOfCoverage: vm.countryCode, contentType: 'literature', limit: vm.limit}, function(data) {
        vm.literatureAbout = data;
    }, function() {
        // TODO handle request error
    });

    ResourceSearch.query({countriesOfResearcher: vm.countryCode, contentType: 'literature', limit: vm.limit}, function(data) {
        vm.literatureFrom = data;
    }, function() {
        // TODO handle request error
    });
}

module.exports = countryResearchCtrl;
