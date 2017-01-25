'use strict';

var angular = require('angular'),
    parseGeometry = require('wellknown');

angular
    .module('portal')
    .directive('filterLocation', filterLocationDirective);

/** @ngInject */
function filterLocationDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterLocation/filterLocation.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterLocation,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterLocation($scope, $filter, OccurrenceFilter, localStorageService) {
        var vm = this;
        vm.hasCoordinate;
        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.translationPrefix = vm.filterConfig.translationPrefix || vm.filterConfig.title;
        vm.filterAutoUpdate = vm.filterConfig.filterAutoUpdate !== false;
        vm.collapsed = vm.filterConfig.collapsed !== false;

        vm.query = $filter('unique')(vm.filterState.query[vm.queryKey]);

        vm.geometryOptions = [];
        vm.geometrySuggestions = [];

        function addGeometryOption(arr, str, active) {
            arr.push({
                q: str,
                valid: isValidWKT(str),
                active: active
            });
        }

        function addGeometrySuggestion(wkt) {
            if (!wkt || !isValidWKT(wkt)) {
                return false;
            }
            if(localStorageService.isSupported) {
                var filters = localStorageService.get('filters');
                if (!filters) {
                    filters = [];
                }
                filters.unshift(wkt);
                filters = $filter('unique')(filters).slice(0,20);
                vm.geometrySuggestions = filters;
                localStorageService.set('filters', filters);
                updateGeometrySuggestions();
            }
        }

        function addSuggestions(queries) {
            queries = queries || [];
            queries.forEach(function(wkt){
                addGeometrySuggestion(wkt);
            });
        }

        function updateGeometrySuggestions() {
            var filters = [];
            if(localStorageService.isSupported) {
                filters = localStorageService.get('filters');
                if (!filters) {
                    filters = [];
                }
            }
            vm.geometrySuggestions = [];
            filters.forEach(function(q){
                if(vm.query.indexOf(q) < 0) {
                    addGeometryOption(vm.geometrySuggestions, q, false);
                }
            });
        }

        addSuggestions(vm.query);
        updateGeometrySuggestions();

        vm.query.forEach(function(q){
            addGeometryOption(vm.geometryOptions, q, true);
        });

        vm.hasCoordinate = vm.filterState.query.has_coordinate;
        if (vm.hasCoordinate === 'true' || (vm.query && vm.query.length)) {
            vm.hasCoordinate = true;
        } else if(vm.hasCoordinate === 'false') {
            vm.hasCoordinate = false;
        } else {
            vm.hasCoordinate = undefined;
        }

        vm.addString = function() {
            var parsingResult = parseStringToWKTs(vm.geometryString);
            if (parsingResult.geometry) {
                $filter('unique')(parsingResult.geometry).forEach(function(q){
                    addGeometrySuggestion(q);
                    addGeometryOption(vm.geometryOptions, q, true);
                });
                vm.invalidTextInput = false;
                vm.geometryString = undefined;
                vm.apply();
            } else {
                vm.invalidTextInput = true;
            }
        };

        vm.hasCoordinateChange = function() {
            vm.query = [];
            vm.includeSuspicious = false;
            vm.apply();
        };

        //vm.getLocationNames = function() {
        //    for (var i = 0; i < vm.query; i++) {
        //        $http.get('http://localhost:3003/geometry-description', {});
        //    }
        //};

        $scope.$watch(function () {
            return vm.filterState.query[vm.queryKey]
        }, function (newQuery) {
            vm.query = $filter('unique')(newQuery);
            if (vm.query && vm.query.length) {
                vm.hasCoordinate = true;
                addSuggestions(vm.query);
            }
            vm.geometryOptions = [];
            vm.query.forEach(function(q){
                addGeometryOption(vm.geometryOptions, q, true);
            });
            updateGeometrySuggestions();
        });

        vm.removeFromList = function (index, geom) {
            vm.geometryOptions.splice(index, 1);
            //filter suggestions
            vm.apply();
        };

        vm.addToList = function (index, geom) {
            vm.hasCoordinate = true;
            addGeometryOption(vm.geometryOptions, geom.q, true);
            if (geom.valid) {
                addGeometrySuggestion(geom.q);
            }
            vm.apply();
        };

        vm.getQuery = function() {
            var geometries = vm.geometryOptions.filter(function(geo){
                return geo.active;
            }).map(function(geo){
                return geo.q;
            });
            geometries = $filter('unique')(geometries);
            return geometries;
        };

        vm.apply = function () {
            console.log('apply');
            var filters = {
                has_coordinate: vm.hasCoordinate,
                has_geospatial_issue: undefined,
                geometry: vm.getQuery()
            };
            if (!filters.geometry || filters.geometry.length == 0) {
                filters.geometry = undefined;
            }
            if (vm.hasCoordinate && !vm.includeSuspicious) {
                filters.has_geospatial_issue = false;
            } else if (!vm.hasCoordinate) {
                vm.geometryOptions = [];
                filters.geometry = undefined;
            }
            OccurrenceFilter.updateParams(filters);
        }
    }
}

module.exports = filterLocationDirective;

function parseStringToWKTs(str) {
    console.log('parse');
    var leafletGeoJson, wktGeometries = [];
    //assume geojson
    try {
        var geojsonGeometry = JSON.parse(str);
        leafletGeoJson = L.geoJson(geojsonGeometry);
        var geojson = leafletGeoJson.toGeoJSON();
        for (var i = 0; i < geojson.features.length; i++) {
            var feature = geojson.features[i];
            var wktGeom = parseGeometry.stringify(feature);
            wktGeometries.push(wktGeom);
        }
    } catch(e) {
        //not a json object. try to parse as wkt
        try {
            geojsonGeometry = parseGeometry(str);
            if (geojsonGeometry) {
                leafletGeoJson = L.geoJson(geojsonGeometry);
                var geojson = leafletGeoJson.toGeoJSON();
                for (var i = 0; i < geojson.features.length; i++) {
                    var feature = geojson.features[i];
                    var wktGeom = parseGeometry.stringify(feature);
                    wktGeometries.push(wktGeom);
                }
            } else {
                throw 'Not valid wkt';
            }
        } catch(err) {
            console.log('NOT A VALID WKT OR GEOJSON');
            return {
                error: 'FAILED_PARSING'
            }
        }
    }
    return {
        geometry: wktGeometries
    };
}

function isValidWKT(str) {
    var geojsonGeometry = parseGeometry(str);
    if (geojsonGeometry) {
        return true;
    } else {
        return false;
    }
}