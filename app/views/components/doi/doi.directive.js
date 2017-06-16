'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('doi', doiDirective);

/** @ngInject */
function doiDirective() {
    var directive = {
        restrict: 'E',
        template: '<a ng-href="https://doi.org/{{ vm.link | limitTo:100:4 }}" class="doi"><span>DOI</span><span>{{ vm.link | limitTo:100:4 }}</span></a>',
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
    }
}

module.exports = doiDirective;

