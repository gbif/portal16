'use strict';

var angular = require('angular');
var config = require('../config');

require('../occurrenceBreakdown.directive');
require('../header/occurrenceBreakdownHeader.directive');
require('../settings/occurrenceBreakdownSettings.directive');

angular
    .module('portal')
    .directive('occurrenceBreakdownCard', occurrenceBreakdownCardDirective);

/** @ngInject */
function occurrenceBreakdownCardDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceBreakdown/card/occurrenceBreakdownCard.html?v=' + BUILD_VERSION,
        scope: {
            api: '=',
            options: '='
        },
        controller: occurrenceBreakdownCard,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function occurrenceBreakdownCard($scope) {
        var vm = this;
        vm.config = config;
        vm.display = {showSettings: true, type: 'COLUMN'};
        vm.options.offset = vm.options.offset || 0;
        vm.options.limit = vm.options.limit || 10;

        vm.isSupported = function(type) {
            if (vm.api.getDimension) {
                return config.supportedTypes[vm.api.getDimension()].indexOf(type) > -1;
            } else {
                return false;
            }
        };

        vm.nextPage = function() {
            vm.options.offset = vm.options.offset + vm.options.limit;
        };

        vm.prevPage = function() {
            vm.options.offset = Math.max(0, vm.options.offset - vm.options.limit);
        };
    }
}

module.exports = occurrenceBreakdownCardDirective;
