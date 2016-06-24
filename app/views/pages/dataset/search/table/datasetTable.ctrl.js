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
function datasetTableCtrl(results, $stateParams, $state, $http) {
    var vm = this,
        offset = parseInt($stateParams.offset) || 0;

    vm.count = results.count;
    vm.results = results.results;
    vm.featuredDataSets = {
        nodes: []
    };

    //pagination
    vm.maxSize = 5;
    vm.limit = parseInt($stateParams.limit) || 20;
    vm.totalItems = results.count;
    vm.currentPage = Math.floor(offset / vm.limit) + 1;

    vm.pageChanged = function() {
        $stateParams.offset =  (vm.currentPage-1) * vm.limit;
        $state.go($state.current, $stateParams, {reload: true});
    };

    vm.getFeatured = function() {
        //http://www.gbif.org/featured-datasets/json
        $http({
            method: 'GET',
            url: 'http://www.gbif.org/featured-datasets/json'
        }).then(function successCallback(response) {
            vm.featuredDataSets.nodes = response.data.nodes;
        }, function errorCallback(response) {
            //ignore any errors and just do not show feeatured datasets
        });
    };
    var keys = Object.keys($stateParams).reduce(function(prev, curr){
        var v = !!$stateParams[curr]? 1 : 0;
        return prev + v;
    }, 0);

    if (keys == 1) {//lang key
        vm.getFeatured();
    }
}

module.exports = datasetTableCtrl;

