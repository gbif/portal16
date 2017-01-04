'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('combinations', combinationsDirective);

/** @ngInject */
function combinationsDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/combinations.html',
        scope: {},
        controller: combinationsCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@'
        }
    };
    return directive;

    /** @ngInject */
    function combinationsCtrl(SpeciesCombinations) {
        var vm = this;
        vm.combinations;

        SpeciesCombinations.query({
            id: vm.key

        }, function (data) {
            console.log(data);
            vm.combinations = data;

        }, function () {
        })
    }
}

module.exports = combinationsDirective;

