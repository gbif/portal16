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
        template: '<a ng-href="{{ vm.link }}" ng-if="vm.isSpecified(vm.link)"><span translate="license.{{vm.type(vm.link)}}">{{vm.link | limitTo:10}}</span></a><span ng-if="!vm.isSpecified(vm.link)" translate="license.UNSPECIFIED"></span>',
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
            'http://creativecommons.org/licenses/by-nc/4.0/legalcode': 'CC_BY_NC_4_0',
        };
        vm.type = function(link){
            var t = licenseMap[link];
            return t ? t : 'UNSUPPORTED';
        };

        vm.isSpecified = function(link){
            return !_.isUndefined(link) && link !== 'unspecified';
        };
    }
}

module.exports = licenseDirective;