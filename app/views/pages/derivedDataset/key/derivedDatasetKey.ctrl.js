'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('derivedDatasetKeyCtrl', derivedDatasetKeyCtrl);

/** @ngInject */
function derivedDatasetKeyCtrl() {
    var vm = this;

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
