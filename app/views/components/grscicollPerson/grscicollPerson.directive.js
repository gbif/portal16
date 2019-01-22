'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('grscicollperson', grscicollPersonDirective);

/** @ngInject */
function grscicollPersonDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/components/grscicollPerson/grscicollPerson.html?v=' + BUILD_VERSION,
        scope: {
            person: '='
        },
        controller: grscicollPersonCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function grscicollPersonCtrl() {
        var vm = this;
        vm.person = vm.person;

        vm.getAsArray = function(value) {
            return angular.isArray(value) ? value : [value];
        };
    }
}

module.exports = grscicollPersonDirective;

