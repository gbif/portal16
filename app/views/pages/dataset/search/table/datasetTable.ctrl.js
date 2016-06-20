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
    .controller('datasetTableCtrl', datasetTableCtrl);

/** @ngInject */
function datasetTableCtrl($scope, DatasetFilter) {
    var vm = this;
    vm.count = 0;
    vm.results = {};
    DatasetFilter.setCurrentTab();

    vm.search = function() {
        DatasetFilter.search(function(data){
            vm.results = data.results;
            vm.count = data.count;
        });
    };

    $scope.$watchCollection(DatasetFilter.getQuery, function() {
        vm.search();
    });
}

module.exports = datasetTableCtrl;
