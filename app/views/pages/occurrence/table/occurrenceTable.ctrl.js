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
function occurrenceTableCtrl($scope, OccurrenceTableSearch, OccurrenceFilter, $filter, $state, $stateParams, hotkeys, results) {
    var vm = this, offset;
    vm.count = results.count;
    vm.results = results.results;

    //a pretty print for coordinates.
    //TODO create as reusable filter/formater 
    vm.formatCoordinates = function(lat, lng) {
        if (angular.isUndefined(lat) || angular.isUndefined(lng)) {
            return '';
        } else {
            var la = $filter('number')(lat, 1) + (lat < 0 ? 'S' : 'N');
            var lo = $filter('number')(lng, 1) + (lng < 0 ? 'W' : 'E');
            return la + ', ' + lo;
        }
    };

    // // watch state params and fetch new data if it changes
    $scope.$watchCollection(function(){return $stateParams}, function(newValue) {
        // console.log('update me');
        OccurrenceTableSearch.query(newValue, function(data){
            vm.count = data.count;
            vm.results = data.results;
            updatePaginationCounts();
        }, function () {
            //TODO handle errors
        });
    });

    /* pagination */
    function updatePaginationCounts() {
        offset = parseInt($stateParams.offset) || 0;
        vm.maxSize = 5;
        vm.limit = parseInt($stateParams.limit) || 20;
        vm.totalItems = vm.count;
        vm.currentPage = Math.floor(offset / vm.limit) + 1;
    }
    updatePaginationCounts();

    vm.pageChanged = function() {
        $stateParams.offset =  (vm.currentPage-1) * vm.limit;
        $state.go($state.current, $stateParams, {notify: false, reload: true});
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

}

module.exports = occurrenceTableCtrl;
