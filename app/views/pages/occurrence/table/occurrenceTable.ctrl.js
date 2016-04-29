/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceTableCtrl', occurrenceTableCtrl);

/** @ngInject */
function occurrenceTableCtrl(OccurrenceSearch, $stateParams) {
    var vm = this;
    vm.count = 0;
    vm.results = {};
    vm.query = angular.copy($stateParams);

    vm.search = function() {
        OccurrenceSearch.query(vm.query, function (data) {
            vm.count = data.count;
            vm.results = data.results;
        }, function () {
        });
    };

    vm.search();
}

module.exports = occurrenceTableCtrl;
