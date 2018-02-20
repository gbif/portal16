'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('license', licenseDirective);

/** @ngInject */
function licenseDirective() {
    var directive = {
        restrict: 'E',
        template: '<a ng-href="{{ vm.link }}" ng-if="vm.isValid(vm.link)" translate="license.{{vm.name(vm.link)}}"></a><span ng-if="!vm.isValid(vm.link)" translate="license.{{vm.name(vm.link)}}"></span>',
        scope: {
        },
        controller: licenseCtrl,
        controllerAs: 'vm',
        bindToController: {
            link: '@'
        }
    };
    return directive;

    /** @ngInject */
    function licenseCtrl() {
        var vm = this;
        var licenseMap = {
            'http://creativecommons.org/publicdomain/zero/1.0/legalcode': 'CC0_1_0',
            'http://creativecommons.org/licenses/by/4.0/legalcode': 'CC_BY_4_0',
            'http://creativecommons.org/licenses/by-nc/4.0/legalcode': 'CC_BY_NC_4_0'
        };
        vm.name = function(link) {
            if (link == 'unspecified') {
                return 'UNSPECIFIED';
            }
            var t = licenseMap[link];
            return t ? t : 'UNSUPPORTED';
        };

        vm.isValid = function(link) {
            return !!licenseMap[link];
        };
    }
}

module.exports = licenseDirective;
