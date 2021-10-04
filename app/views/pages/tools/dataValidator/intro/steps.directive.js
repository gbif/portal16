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
            steps: '=',
            status: '='
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
            var queuedStepFound = false;
            vm.sortedSteps = newSteps
            .sort(function (a, b) {
                return a.executionOrder - b.executionOrder;
            })
            .map(function (s) {
                if (!s.status) {
                    if (vm.status === 'QUEUED' && !queuedStepFound) {
                        s.status = 'QUEUED';
                        queuedStepFound = true;
                    } else {
                        s.status = 'PENDING';
                    }
                }
                return s;
            });
        });

        // vm.loading = true;
    }
}

module.exports = validationStepsDirective;
