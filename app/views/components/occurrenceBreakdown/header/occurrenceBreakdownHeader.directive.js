'use strict';


var angular = require('angular');
var config = require('../config');

angular
    .module('portal')
    .directive('occurrenceBreakdownHeader', occurrenceBreakdownHeaderDirective);

/** @ngInject */
function occurrenceBreakdownHeaderDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceBreakdown/header/occurrenceBreakdownHeader.html?v=' + BUILD_VERSION,
        scope: {
            api: '=',
            options: '=',
            display: '='
        },
        controller: occurrenceBreakdownHeader,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function occurrenceBreakdownHeader($scope) {
        var vm = this;
        vm.config = config;

        vm.isSupported = function(type) {
            if (vm.api.getDimension) {
                return vm.api.getSupportedTypes()[type];
            } else {
                return false;
            }
        };

        // vm.updateSupportChartTypes = function() {
        //     vm.supported.PIE = true;
        //     vm.supported.TABLE = true;
        // };
        // vm.updateSupportChartTypes();

        // vm.exportOptions = [{
        //    textKey: 'printChart',
        //    onclick: function () {
        //        vm.api.print();
        //    }
        // }, {
        //    separator: true
        // }, {
        //    textKey: 'downloadPNG',
        //    onclick: function () {
        //        vm.api.exportChart();
        //    }
        // }];
    }
}

module.exports = occurrenceBreakdownHeaderDirective;
