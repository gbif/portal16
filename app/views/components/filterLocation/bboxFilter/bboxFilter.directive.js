'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('bboxFilter', bboxFilterDirective);

/** @ngInject */
function bboxFilterDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/filterLocation/bboxFilter/bboxFilter.html?v=' + BUILD_VERSION,
        scope: {},
        controller: bboxFilter,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function bboxFilter(OccurrenceFilter, $filter) {
        var vm = this;
        vm.north = 90;
        vm.south = -90;
        vm.west = -180;
        vm.east = 180;

        vm.state = OccurrenceFilter.getOccurrenceData();
        vm.form = 'bboxFilter';

        function getWKT() {
            var N = vm.north,
                S = vm.south,
                W = vm.west,
                E = vm.east;

            if (Math.abs(E-W) >= 360) {
                W = -180;
                E = 180;
            }

            var hasUndefined = angular.isUndefined(N) || angular.isUndefined(S) || angular.isUndefined(W) || angular.isUndefined(E);
            if (hasUndefined || W >= E || S >= N || Math.abs(N) > 90 || Math.abs(S) > 90) {
                vm.invalidInput = true;
                return false;
            }

            var str = 'POLYGON' + '((W S,W N,E N,E S,W S))'
                    .replace(/N/g, +N.toFixed(3))
                    .replace(/S/g, +S.toFixed(3))
                    .replace(/W/g, +W.toFixed(3))
                    .replace(/E/g, +E.toFixed(3));
            return str;
        }

        vm.add = function() {
            var rectangle = getWKT();
            if (rectangle) {
                var geometries = $filter('unique')([rectangle].concat(vm.state.query.geometry));
                OccurrenceFilter.updateParams({geometry: geometries});
            }
        };

        var format = {
            to: function(value) {
                return parseInt(value);
            },
            from: function(value) {
                return parseInt(value);
            }
        };

        vm.sliderLongitude = {
            start: [-180, 180],
            margin: 0.001,
            behaviour: 'drag',
            limit: 360,
            range: {
                'min': [-359],
                'max': [359]
            },
            format: format,
            step: 1,
            connect: true
        };

        vm.sliderLatitude = {
            start: [-90, 90],
            margin: 0.001,
            behaviour: 'drag',
            range: {
                'min': [-90],
                'max': [90]
            },
            format: format,
            step: 1,
            connect: true
        };

        vm.latSliderHandlers = {
            slide: function(values, handle, unencoded) {
                vm.south = parseInt(unencoded[0]);
                vm.north = parseInt(unencoded[1]);
                vm.invalidInput = false;
            }
        };

        vm.lngSliderHandlers = {
            slide: function(values, handle, unencoded) {
                vm.west = parseInt(unencoded[0]);
                vm.east = parseInt(unencoded[1]);
                vm.invalidInput = false;
            }
        };

        vm.updateSliders = function() {
            vm.sliderLongitude.start[0] = vm.west;
            vm.sliderLongitude.start[1] = vm.east;

            vm.sliderLatitude.start[0] = vm.south;
            vm.sliderLatitude.start[1] = vm.north;
            vm.invalidInput = false;
        };
    }
}


module.exports = bboxFilterDirective;
