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
function occurrenceTableCtrl($scope, OccurrenceSearch, OccurrenceFilter, $filter, $state, $stateParams, hotkeys, results) {
    var vm = this,
        offset = parseInt($stateParams.offset) || 0;
    vm.count = results.count;
    vm.results = results.results;
    //OccurrenceFilter.setCurrentTab();


    vm.openOccurrence = function(key) {
        window.location.href = './' + key;
    };

    vm.formatCoordinates = function(lat, lng) {
        if (angular.isUndefined(lat) || angular.isUndefined(lng)) {
            return '';
        } else {
            var la = $filter('number')(lat, 1) + (lat < 0 ? 'S' : 'N');
            var lo = $filter('number')(lng, 1) + (lng < 0 ? 'W' : 'E');
            return la + ', ' + lo;
        }
    };

    $scope.$watchCollection(OccurrenceFilter.getQuery, function() {
        OccurrenceSearch.query($stateParams, function(data){
            vm.count = data.count;
            vm.results = data.results;
            updatePaginationCounts();
        }, function () {
            //TODO handle errors
        });
    });



    //pagination
    vm.maxSize = 5;
    vm.limit = parseInt($stateParams.limit) || 20;
    vm.totalItems = 1000;//vm.results.count;
    vm.currentPage = Math.floor(offset / vm.limit) + 1;

    function updatePaginationCounts() {
        offset = parseInt($stateParams.offset) || 0;
        vm.maxSize = 5;
        vm.limit = parseInt($stateParams.limit) || 20;
        vm.totalItems = vm.count;
        vm.currentPage = Math.floor(offset / vm.limit) + 1;
    }

    vm.pageChanged = function() {
        $stateParams.offset =  (vm.currentPage-1) * vm.limit;
        $state.go($state.current, $stateParams, {notify: false, reload: false});
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

    vm.test = function() {
        vm.results = [{}];
    };
    //vm.search = function() {
    //    vm.query = angular.copy(OccurrenceFilter.query);
    //    OccurrenceSearch.query(vm.query, function (data) {
    //        vm.count = data.count;
    //        vm.results = data.results;
    //        updatePaginationCounts();
    //    }, function () {
    //    });
    //};


}

module.exports = occurrenceTableCtrl;
