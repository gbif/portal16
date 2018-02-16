'use strict';


let angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('occurrenceChartHeader', occurrenceChartHeaderDirective);

/** @ngInject */
function occurrenceChartHeaderDirective(BUILD_VERSION) {
    let directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceChart/occurrenceChartHeader.html?v=' + BUILD_VERSION,
        scope: {
            api: '=',
            options: '=',
        },
        controller: occurrenceChartHeader,
        controllerAs: 'vm',
        bindToController: true,
    };

    return directive;

    /** @ngInject */
    function occurrenceChartHeader($scope) {
        let vm = this;

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

module.exports = occurrenceChartHeaderDirective;
