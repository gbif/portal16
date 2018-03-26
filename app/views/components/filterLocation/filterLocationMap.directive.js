'use strict';

var angular = require('angular'),
    mapController = require('./map');

angular
    .module('portal')
    .directive('filterLocationMap', filterLocationMapDirective);

/** @ngInject */
function filterLocationMapDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/filterLocation/filterLocationMap.html?v=' + BUILD_VERSION,
        scope: {},
        link: mapLink,
        controller: filterLocationMap,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function filterLocationMap($scope, OccurrenceFilter, $filter) {
        var vm = this,
            map;

        $scope.create = function(element) {
           // map = createMap(element, OccurrenceFilter);
           var state = OccurrenceFilter.getOccurrenceData();
           var options = (state.query.geometry) ? {fitExtent: true, filters: state.query} : {};
           map = mapController.createMap(element, options);
            map.enableModify( function(wkt) {
                OccurrenceFilter.updateParams({geometry: $filter('unique')(wkt), has_geospatial_issue: false});
            });
        };
        vm.state = OccurrenceFilter.getOccurrenceData();
        $scope.$watch(function() {
            return vm.state.query.geometry;
        }, function(newQuery) {
            var query = $filter('unique')(newQuery);
            if (query && map) {
                map.removeDrawnItems();
                map.update({fitExtent: true, filters: vm.state.query});
            }
        });

        $scope.$watch(function() {
            return vm.state.query.has_coordinate;
        }, function(newval, oldval) {
            if (oldval && typeof newval === 'undefined' ) {
                map.removeDrawnItems();
            }
        });

        vm.zoomIn = function() {
            var view = map.map.getView();
            view.setZoom(view.getZoom() + 1);
        };

        vm.zoomOut = function() {
            var view = map.map.getView();
            view.setZoom(view.getZoom() - 1);
        };
        vm.enableRectangleDraw = function() {
           // map.removeDrawnItems();
            map.disableDraw();
            vm.polygonDrawActive = false;
            vm.rectangleDrawActive = !vm.rectangleDrawActive;
            if (vm.rectangleDrawActive) {
                map.enableDraw('Rectangle', function(wkt) {
                    OccurrenceFilter.updateParams({geometry: $filter('unique')(wkt), has_geospatial_issue: false});
                    vm.rectangleDrawActive = false;
                });
            }
        };
        vm.enablePolygonDraw = function() {
            // map.removeDrawnItems();
            map.disableDraw();
            vm.rectangleDrawActive = false;
            vm.polygonDrawActive = !vm.polygonDrawActive;
            if (vm.polygonDrawActive) {
                map.enableDraw('Polygon', function(wkt) {
                    OccurrenceFilter.updateParams({geometry: $filter('unique')(wkt), has_geospatial_issue: false});
                    vm.polygonDrawActive = false;
                });
            }
        };
        vm.removeDrawnItems = function() {
            if (vm.rectangleDrawActive || vm.polygonDrawActive) {
                map.disableDraw();
            }
            vm.rectangleDrawActive = false;
            vm.polygonDrawActive = false;
            map.removeDrawnItems();
            OccurrenceFilter.updateParams({geometry: undefined});
        };
        vm.enableDeleteMode = function() {
            vm.deleteMode = true;
            map.deleteMode(function(wkt) {
                var geom = (wkt && wkt.length > 0) ? $filter('unique')(wkt) : undefined;
                OccurrenceFilter.updateParams({geometry: geom, has_geospatial_issue: false});
                vm.deleteMode = false;
            });
        };
    }
}

module.exports = filterLocationMapDirective;
