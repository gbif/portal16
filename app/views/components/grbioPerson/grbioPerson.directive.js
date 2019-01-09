'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('grbioperson', grbioPersonDirective);

/** @ngInject */
function grbioPersonDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/components/grbioPerson/grbioPerson.html?v=' + BUILD_VERSION,
        scope: {
            person: '='
        },
        controller: grbioPersonCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function grbioPersonCtrl() {
        var vm = this;
        vm.person = vm.person;

        vm.getAsArray = function(value) {
            return angular.isArray(value) ? value : [value];
        };
    }
}

module.exports = grbioPersonDirective;

