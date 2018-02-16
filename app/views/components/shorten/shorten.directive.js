'use strict';

let angular = require('angular');
angular
    .module('portal')
    .directive('shorten', shortenDirective);

/** @ngInject */
function shortenDirective() {
    let directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/shorten/shorten.html',
        scope: {
            shortenMore: '=',
            shortenExpanded: '=',
        },
        controller: shorten,
        controllerAs: 'vm',
        bindToController: true,
    };

    return directive;

    /** @ngInject */
    function shorten() {
        let vm = this;
        vm.isExpanded = vm.shortenExpanded;
        vm.more = vm.shortenMore || 'more';
    }
}

module.exports = shortenDirective;
