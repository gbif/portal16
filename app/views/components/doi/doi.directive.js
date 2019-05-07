'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('doi', doiDirective);

/** @ngInject */
function doiDirective() {
    var directive = {
        restrict: 'E',
        template: '<a dir="ltr" ng-href="https://doi.org/{{ vm.asDoi(vm.link) }}" class="doi"><span>DOI</span><span>{{ vm.asDoi(vm.link) }}</span></a>',
        scope: {
        },
        controller: doiCtrl,
        controllerAs: 'vm',
        bindToController: {
            link: '@'
        }
    };
    return directive;

    /** @ngInject */
    function doiCtrl() {
        var vm = this;
        vm.asDoi = function() {
            return vm.link.replace(/^.*(10\.)/, '10.');
        };
    }
}

module.exports = doiDirective;

