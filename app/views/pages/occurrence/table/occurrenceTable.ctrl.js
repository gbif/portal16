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
function occurrenceTableCtrl($scope, $filter, hotkeys, OccurrenceFilter, $mdDialog) {
    var vm = this, offset;
    vm.occurrenceState = OccurrenceFilter.getOccurrenceData();
    // a pretty print for coordinates.
    // TODO create as reusable filter/formater
    vm.formatCoordinates = function(lat, lng) {
        if (angular.isUndefined(lat) || angular.isUndefined(lng)) {
            return '';
        } else {
            var la = $filter('number')(Math.abs(lat), 1) + (lat < 0 ? 'S' : 'N');
            var lo = $filter('number')(Math.abs(lng), 1) + (lng < 0 ? 'W' : 'E');
            return la + ', ' + lo;
        }
    };

    /* pagination */
    function updatePaginationCounts() {
        offset = parseInt(vm.occurrenceState.query.offset) || 0;
        vm.maxSize = 5;
        vm.limit = parseInt(vm.occurrenceState.query.limit) || 20;
        vm.currentPage = Math.floor(offset / vm.limit) + 1;
    }

    updatePaginationCounts();

    vm.pageChanged = function() {
        vm.occurrenceState.query.offset = (vm.currentPage - 1) * vm.limit;
        OccurrenceFilter.update(vm.occurrenceState.query);
        updatePaginationCounts();
        window.scrollTo(0, 0);
    };

    // $scope.$watch(function(){return vm.occurrenceState.query.offset}, updatePaginationCounts);

    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function() {
            if (offset + vm.limit < vm.occurrenceState.table.count) {
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
        return typeof vm.occurrenceState.table.count !== 'undefined';
    };


    vm.showTableCustomization = function(ev) {
        $mdDialog.show({
          controller: DialogController,
          templateUrl: 'dialog1.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true
        })
        .then(function(answer) {
          $scope.status = 'You said the information was "' + JSON.stringify(answer) + '".';
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });
      };

      function DialogController($scope, $mdDialog) {
        $scope.hide = function() {
          $mdDialog.hide();
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
          $mdDialog.hide(answer);
        };
      }
}

module.exports = occurrenceTableCtrl;
