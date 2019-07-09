'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('countryProjectsCtrl', countryProjectsCtrl);

/** @ngInject */
function countryProjectsCtrl($stateParams, ResourceSearch) {
    var vm = this;
    vm.countryCode = $stateParams.key;
    vm.limit = 20;
    vm.locale = gb.locale;


    ResourceSearch.query({contractCountry: vm.countryCode, contentType: 'project', limit: vm.limit}, function(data) {
        vm.projects = data;
    }, function() {
        // TODO handle request error
    });
}

module.exports = countryProjectsCtrl;
