'use strict';

var angular = require('angular');

angular.module('portal').directive('validationSteps', validationStepsDirective);

/** @ngInject */
function validationStepsDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/tools/dataValidator/intro/steps.html',
        controller: stepsCtrl,
        controllerAs: 'vm',
        scope: {
            steps: '='
        },
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function stepsCtrl($scope) {
        var vm = this;
        $scope.$watch(function() {
            return vm.steps;
        }, function(newSteps) {
            vm.sortedSteps = newSteps
            .map(function (s) {
                if (!s.status) {
                    s.status = 'PENDING';
                }
                return s;
            })
            .sort(function (a, b) {
                return a.executionOrder - b.executionOrder;
            });
        });
        
        // vm.loading = true;
    }
}

module.exports = validationStepsDirective;
