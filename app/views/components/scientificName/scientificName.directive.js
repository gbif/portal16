'use strict';

let angular = require('angular');

angular
    .module('portal')
    .directive('scientificName', scientificNameDirective);

/** @ngInject */
function scientificNameDirective() {
    let directive = {
        restrict: 'A',
        template: '<span ng-bind-html="vm.parsedName"></span>',
        scope: {},
        controller: scientificNameCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@',
            name: '@',
        },
    };

    return directive;

    /** @ngInject */
    function scientificNameCtrl(SpeciesParsedName) {
        let vm = this;
        vm.parsedName = vm.name;
        SpeciesParsedName.get({id: vm.key}, function(data) {
            if (data.n) {
                vm.parsedName = data.n;
            }
        }, function() {
            // ignore error and show the plain unformated name
        });
    }
}

module.exports = scientificNameDirective;

