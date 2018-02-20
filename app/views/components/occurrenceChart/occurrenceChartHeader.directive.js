'use strict';


var angular = require('angular');

angular
    .module('portal')
    .directive('occurrenceChartHeader', occurrenceChartHeaderDirective);

/** @ngInject */
function occurrenceChartHeaderDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceChart/occurrenceChartHeader.html?v=' + BUILD_VERSION,
        scope: {
            api: '=',
            options: '='
        },
        controller: occurrenceChartHeader,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function occurrenceChartHeader($scope) {
        // var vm = this;

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
