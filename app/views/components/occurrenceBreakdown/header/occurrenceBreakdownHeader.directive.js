'use strict';


var angular = require('angular');

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
            options: '='
        },
        controller: occurrenceBreakdownHeader,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function occurrenceBreakdownHeader($scope) {
        var vm = this;

        vm.isSupported = function(type) {
            return vm.api.options.supportedTypes[vm.api.getDimension()].indexOf(type) > -1;
        };
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
