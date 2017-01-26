'use strict';

var angular = require('angular'),
    parseGeometry = require('wellknown');

angular
    .module('portal')
    .directive('bboxFilter', bboxFilterDirective);

/** @ngInject */
function bboxFilterDirective() {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/filterLocation/bboxFilter/bboxFilter.html',
        scope: {},
        link: mapLink,
        controller: bboxFilter,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {//, attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function bboxFilter($scope, OccurrenceFilter, $filter) {
        var vm = this;
        vm.north = 90;
        vm.south = -90;
        vm.west = -180;
        vm.east = 180;

        vm.state = OccurrenceFilter.getOccurrenceData();
        vm.form = 'bboxFilter';
        $scope.create = function (element) {

        };

        /**
         * cap latitude (north south) to be within -90 to 90. no wrapping as we do not do that when displaying the map
         * @param n
         * @returns {number} -110 will return -90. 92 will return 90
         */
        function capBounds(n) {
            var m = typeof n === 'number' ? n : 0;
            m = Math.min(90, m);
            m = Math.max(-90, m);
            return m;
        }

        /**
         * get as wkt, but cap latitude to +-90
         */
        function getWKT() {
            var N = capBounds(vm.north),
                S = capBounds(vm.south),
                W = vm.west,
                E = vm.east;
            if (Math.abs(E-W) >= 360) {
                W = -180;
                E = 180;
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
            var geometries = $filter('unique')([rectangle].concat(vm.state.query.geometry));
            OccurrenceFilter.updateParams({geometry: geometries});
        };

        var format = {
            to: function (value) {
                return parseInt(value);
            },
            from: function (value) {
                return parseInt(value);
            }
        };

        vm.sliderLongitude = {
            start: [-180, 180],
            margin: 0.001,
            behaviour: 'drag',
            range: {
                'min': [-359, 1],
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
                'min': [-90, 1],
                'max': [90]
            },
            format: format,
            step: 1,
            connect: true
        };

        vm.longitudeSliderHandlers = {
            change: function () { //, handle, unencoded
                vm.snapInput();
            }
        };
        vm.latitudeSliderHandlers = {
            change: function () { //, handle, unencoded
                vm.snapInput();
            }
        };

        vm.snapInput = function() {
            vm.sliderLongitude.start[0] = parseInt(vm.sliderLongitude.start[0]);
            vm.sliderLongitude.start[1] = parseInt(vm.sliderLongitude.start[1]);
        }
    }
}


module.exports = bboxFilterDirective;
