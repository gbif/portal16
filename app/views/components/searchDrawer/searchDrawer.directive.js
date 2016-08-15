'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('searchDrawer', searchDrawerDirective);

/** @ngInject */
function searchDrawerDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/searchDrawer/searchDrawer.html',
        scope: {
            query: '@',
            filterCount: '@',
            contentType: '@'
        },
        replace: true,
        controller: searchDrawer,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function searchDrawer() {
        var vm = this;
    }
}

module.exports = searchDrawerDirective;
