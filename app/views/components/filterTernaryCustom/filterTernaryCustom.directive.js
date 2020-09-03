'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('filterTernaryCustom', filterTernaryCustomDirective);

/** @ngInject */
function filterTernaryCustomDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterTernaryCustom/filterTernaryCustom.html?v=' + BUILD_VERSION,
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterTernaryCustom,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterTernaryCustom($scope) {
        var vm = this;
        vm.queryKey = vm.filterConfig.queryKey;
        vm.showWarning = false;

        vm.change = function() {
            vm.apply();
        };

        vm.apply = function() {
            vm.filterConfig.filter.updateParam(vm.queryKey, vm.query);
        };

        function updateQuery(q) {
            if (typeof q === 'string') {
                vm.query = q;
            } else {
                vm.query = undefined;
                vm.apply();
            }
        }

        function setWarningFlag() {
          vm.filterConfig.showWarning(function(response) {
            vm.showWarning = response;
          }, function(err) {
            vm.showWarning = false;
          });
        }

        $scope.$watchCollection(function() {
          return vm.filterState.query;
      }, function() {
          setWarningFlag();
      });

        updateQuery(vm.filterState.query[vm.queryKey]);
    }
}

module.exports = filterTernaryCustomDirective;
