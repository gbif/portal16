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

    //search chips
    vm.chips = [];
    //go through facets. if lowercase version exists as a state param then add as chip using the human readable name from the facets
    //vm.possibleChips = ['q', 'type', 'publishing_org', 'hosting_org', 'keyword', 'publishing_country'];
    //results.facets.forEach(function(e){
    //    if (typeof $stateParams[e.field.toLowerCase()] !== 'undefined') {
    //        vm.chips.push({
    //            type: e.field,
    //            value: $stateParams[key]
    //        });
    //    }
    //});

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
        }, function errorCallback() {
            //ignore any errors and just do not show feeatured datasets
        });
    };
    var keys = Object.keys($stateParams).reduce(function(prev, curr){
        var v = $stateParams[curr]? 1 : 0;
        return prev + v;
    }, 0);

    if (keys == 1) {//lang key
        vm.getFeatured();
    }
}

module.exports = datasetTableCtrl;

