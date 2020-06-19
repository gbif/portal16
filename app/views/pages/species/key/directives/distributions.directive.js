'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('distributions', distributionsDirective);

/** @ngInject */
function distributionsDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/distributions.html',
        scope: {},
        controller: distributionsCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@'
        }
    };
    return directive;

    /** @ngInject */
    function distributionsCtrl(SpeciesDistributions) {
        var vm = this;
        vm.distributions = SpeciesDistributions.query({id: vm.key, limit: 200});
    }
}

module.exports = distributionsDirective;

