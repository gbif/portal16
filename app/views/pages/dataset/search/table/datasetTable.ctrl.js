/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .controller('datasetTableCtrl', datasetTableCtrl);

/** @ngInject */
function datasetTableCtrl(hotkeys, DatasetFilter, env, $httpParamSerializer, BUILD_VERSION) {
    var vm = this, offset;
    vm.state = DatasetFilter.getState();
    vm.tileApi = env.tileApi;
    vm.dataApi = env.dataApi;
    vm.BUILD_VERSION = BUILD_VERSION;
    vm.featuredDataSets = {
        nodes: []
    };

    //* pagination */
    function updatePaginationCounts() {
        offset = parseInt(vm.state.query.offset) || 0;
        vm.maxSize = 5;
        vm.limit = parseInt(vm.state.query.limit) || 20;
        vm.currentPage = Math.floor(offset / vm.limit) + 1;
    }

    updatePaginationCounts();

    vm.pageChanged = function() {
        vm.state.query.offset = (vm.currentPage - 1) * vm.limit;
        updatePaginationCounts();
        DatasetFilter.update(vm.state.query);
        window.scrollTo(0, 0);
    };

    vm.getSerializedQuery = function() {
      var query = angular.copy(vm.state.query);
      delete query.locale;
      delete query.advanced;
      delete query.limit;
      delete query.offset;
      query = _.omitBy(query, angular.isUndefined);
      return $httpParamSerializer(query);
  };

    // $scope.$watch(function(){return vm.state.query.offset}, updatePaginationCounts);

    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function() {
            if (offset + vm.limit < vm.state.data.count) {
                vm.currentPage += 1;
                vm.pageChanged();
            }
        }
    });
    hotkeys.add({
        combo: 'alt+left',
        description: 'Previous',
        callback: function() {
            if (offset > 0) {
                vm.currentPage -= 1;
                vm.pageChanged();
            }
        }
    });


    vm.hasData = function() {
        return typeof vm.state.data.count !== 'undefined';
    };


    // vm.getFeatured = function() {
    //     var keys = Object.keys($stateParams).reduce(function(prev, curr){
    //         var v = $stateParams[curr]? 1 : 0;
    //         return prev + v;
    //     }, 0);

    //     if (keys == 1) {//lang key
    //         //http://www.gbif.org/featured-datasets/json
    //         $http({
    //             method: 'GET',
    //             url: 'http://www.gbif.org/featured-datasets/json'
    //         }).then(function successCallback(response) {
    //             vm.featuredDataSets.nodes = response.data.nodes;
    //         }, function errorCallback() {
    //             //ignore any errors and just do not show featured datasets
    //         });
    //     }
    // };
    // vm.getFeatured();
}

module.exports = datasetTableCtrl;

