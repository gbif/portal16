'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('derivedDatasetKeyCtrl', derivedDatasetKeyCtrl);

/** @ngInject */
function derivedDatasetKeyCtrl($stateParams) {
    var vm = this;
    vm.prefix = $stateParams.prefix;
    vm.suffix = $stateParams.suffix;
    vm.locale = gb.locale;
    vm.pageChanged = function() {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        window.location.href = window.location.origin + window.location.pathname + '?offset=' + vm.offset + '#datasets';
    };

    vm.setInitials = function(offset, limit) {
        vm.offset = offset || 0;
        vm.limit = limit;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
    };
}

module.exports = derivedDatasetKeyCtrl;
