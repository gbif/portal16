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
    .controller('cmsTableCtrl', cmsTableCtrl);

/** @ngInject */
function cmsTableCtrl(results, $stateParams, $state, $http, hotkeys, env, $sanitize) {
    var vm = this,
        offset = parseInt($stateParams.offset) || 0;

    vm.tileApi = env.tileApi;
    vm.count = results.count;
    vm.results = results.results;
    vm.featuredProse = {
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
        window.scrollTo(0,0);
    };

    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function() {
            if (offset + vm.limit < vm.totalItems) {
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

    vm.getFeatured = function() {
        var keys = Object.keys($stateParams).reduce(function(prev, curr){
            var v = $stateParams[curr]? 1 : 0;
            return prev + v;
        }, 0);

        if (keys == 1) {//lang key
            //http://www.gbif.org/featured-datasets/json
            $http({
                method: 'GET',
                url: 'http://www.gbif.org/featured-datasets/json'
            }).then(function successCallback(response) {
                vm.featuredProse.nodes = response.data.nodes;
            }, function errorCallback() {
                //ignore any errors and just do not show featured contents
            });
        }
    };
    vm.getFeatured();
    
}

module.exports = cmsTableCtrl;

