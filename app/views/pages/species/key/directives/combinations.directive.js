'use strict';

let angular = require('angular');

angular
    .module('portal')
    .directive('combinations', combinationsDirective);

/** @ngInject */
function combinationsDirective() {
    let directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/combinations.html',
        scope: {},
        controller: combinationsCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@',
        },
    };
    return directive;

    /** @ngInject */
    function combinationsCtrl(SpeciesCombinations) {
        let vm = this;
        vm.combinations;

        SpeciesCombinations.query({
            id: vm.key,

        }, function(data) {
            vm.combinations = data;
        }, function() {
        });
    }
}

module.exports = combinationsDirective;

