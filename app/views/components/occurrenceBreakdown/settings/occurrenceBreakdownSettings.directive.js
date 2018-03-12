'use strict';


var angular = require('angular');
var config = require('../config');

angular
    .module('portal')
    .directive('occurrenceBreakdownSettings', occurrenceBreakdownSettingsDirective);

/** @ngInject */
function occurrenceBreakdownSettingsDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceBreakdown/settings/occurrenceBreakdownSettings.html?v=' + BUILD_VERSION,
        scope: {
            api: '=',
            options: '='
        },
        controller: occurrenceBreakdownSettings,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function occurrenceBreakdownSettings($scope) {
        var vm = this;
        vm.config = config;

        vm.isSupported = function(type) {
            if (vm.api.getDimension) {
                return config.supportedTypes[vm.api.getDimension()].indexOf(type) > -1;
            } else {
                return false;
            }
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

module.exports = occurrenceBreakdownSettingsDirective;
