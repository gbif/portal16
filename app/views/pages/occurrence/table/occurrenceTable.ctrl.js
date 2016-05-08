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
function occurrenceTableCtrl($scope, OccurrenceSearch, OccurrenceFilter) {
    var vm = this;
    vm.count = 0;
    vm.results = {};

    vm.search = function() {
        vm.query = angular.copy(OccurrenceFilter.query);
        OccurrenceSearch.query(vm.query, function (data) {
            vm.count = data.count;
            vm.results = data.results;
        }, function () {
        });
    };

    $scope.$watchCollection(OccurrenceFilter.getQuery, function() {
        vm.search();
    });


}

module.exports = occurrenceTableCtrl;
