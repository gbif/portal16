'use strict';

var angular = require('angular'),
    parseGeometry = require('wellknown'),
   // ol = require('ol'),
    WKT = require('ol/format/WKT').default,
    GeoJSON = require('ol/format/GeoJSON').default,
    turf = {
        simplify: require('@turf/simplify'),
        bboxPolygon: require('@turf/bbox-polygon'),
        bbox: require('@turf/bbox'),
        kinks: require('@turf/kinks')
    };

angular
    .module('portal')
    .directive('filterLocation', filterLocationDirective);

/** @ngInject */
function filterLocationDirective(BUILD_VERSION, toastService) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterLocation/filterLocation.html?v=' + BUILD_VERSION,
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
    function filterLocation($scope, $filter, OccurrenceFilter, $localStorage) {
        var vm = this;
        var wktSizeLimit = 5000;
        vm.inputType = 'BBOX';
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
            var filters = $localStorage.filters;
            if (!filters) {
                filters = [];
            }
            filters.unshift(wkt);
            filters = $filter('unique')(filters).slice(0, 20);
            vm.geometrySuggestions = filters;
            $localStorage.filters = filters;
            updateGeometrySuggestions();
        }

        function addSuggestions(queries) {
            queries = queries || [];
            queries.forEach(function(wkt) {
                addGeometrySuggestion(wkt);
            });
        }

        function updateGeometrySuggestions() {
            var filters = [];
            filters = $localStorage.filters;
            if (!filters) {
                filters = [];
            }
            vm.geometrySuggestions = [];
            filters.forEach(function(q) {
                if (vm.query.indexOf(q) < 0) {
                    addGeometryOption(vm.geometrySuggestions, q, false);
                }
            });
        }

        addSuggestions(vm.query);
        updateGeometrySuggestions();

        vm.query.forEach(function(q) {
            addGeometryOption(vm.geometryOptions, q, true);
        });

        vm.getQuery = function() {
            var geometries = vm.geometryOptions.filter(function(geo) {
                return geo.active;
            }).map(function(geo) {
                return geo.q;
            });
            geometries = $filter('unique')(geometries);
            return geometries;
        };

        vm.apply = function() {
            var filters = {
                has_coordinate: vm.hasCoordinate,
                has_geospatial_issue: undefined,
                geometry: vm.getQuery()
            };
            if (!filters.geometry || filters.geometry.length === 0) {
                filters.geometry = undefined;
            }
            if (vm.hasCoordinate && !vm.includeSuspicious) {
                filters.has_geospatial_issue = false;
            } else if (!vm.hasCoordinate) {
                vm.geometryOptions = [];
                filters.geometry = undefined;
            }
            OccurrenceFilter.updateParams(filters);
        };

        function getOptionalBoolean(key) {
            if (key === 'false') return false;
            if (key === 'true') return true;
            return undefined;
        }
        vm.includeSuspicious = typeof vm.filterState.query.has_geospatial_issue === 'undefined';
        vm.suspiciousOnly = vm.filterState.query.has_geospatial_issue === 'true';
        vm.hasCoordinate = getOptionalBoolean(vm.filterState.query.has_coordinate);
        if (vm.query && vm.query.length) {
            vm.hasCoordinate = true;
        }
        if (!vm.hasCoordinate) {
            vm.includeSuspicious = false;
        }

        vm.addString = function() {
            var parsingResult = parseStringToWKTs(vm.geometryString, toastService);

            if (parsingResult.geometry) {
                vm.singleGeometry = parsingResult.geometry.length == 1;
                // test that it isn't too large
                if (JSON.stringify(parsingResult.geometry).length > wktSizeLimit) {
                    vm.invalidTextInput = false;
                    vm.tooLarge = true;
                    return;
                }

                if (parsingResult.isSimplified) {
                    toastService.info({translate: 'occurrenceSearch.polygonSimplifiedToFewerDecimals'});
                }

                vm.hasCoordinate = true;
                $filter('unique')(parsingResult.geometry).forEach(function(q) {
                    addGeometrySuggestion(q);
                    addGeometryOption(vm.geometryOptions, q, true);
                });
                vm.invalidTextInput = false;
                vm.tooLarge = false;
                vm.singleGeometry = false;
                vm.geometryString = undefined;
                vm.apply();
            } else {
                vm.invalidTextInput = true;
            }
        };

        vm.useSimplified = function(tolerance) {
            tolerance = tolerance || 0.001;
            var parsingResult = parseStringToWKTs(vm.geometryString, toastService);
            var geojson = parseGeometry(parsingResult.geometry[0]);
            var options = {tolerance: tolerance, highQuality: true};
            var simplified = turf.simplify(geojson, options);
            var wkt = parseGeometry.stringify(simplified);
            
            // test that wkt is not self intersecting. If so add a toast warning, but still use the simplified geometry
            var intersectionTest = testWktForIntersections(wkt);
            if (intersectionTest.selfIntersecting) {
                toastService.warning({translate: 'occurrenceSearch.simplificationCausedSelfIntersection'});
            }
            if (wkt.length > wktSizeLimit && tolerance <= 10) {
                vm.useSimplified(tolerance * 4);
            } else {
                vm.geometryString = wkt;
                vm.addString();
                toastService.info({translate: 'occurrenceSearch.polygonSimplifiedToFewerPoints'});
            }
        };

        vm.useBBox = function() {
            var parsingResult = parseStringToWKTs(vm.geometryString, toastService);
            var geom = parseGeometry(parsingResult.geometry[0]);
            var bbox = turf.bbox(geom);
            var bboxPolygon = turf.bboxPolygon(bbox);
            var wkt = parseGeometry.stringify(bboxPolygon);
            vm.geometryString = wkt;
            vm.addString();
        };

        vm.hasCoordinateChange = function() {
            vm.query = [];
            vm.includeSuspicious = false;
            vm.apply();
        };

        // vm.getLocationNames = function() {
        //    for (var i = 0; i < vm.query; i++) {
        //        $http.get('http://localhost:3003/geometry-description', {});
        //    }
        // };

        $scope.$watch(function() {
            return vm.filterState.query[vm.queryKey];
        }, function(newQuery) {
            vm.query = $filter('unique')(newQuery);
            if (vm.query && vm.query.length) {
                vm.hasCoordinate = true;
                addSuggestions(vm.query);
            }
            vm.geometryOptions = [];
            vm.query.forEach(function(q) {
                addGeometryOption(vm.geometryOptions, q, true);
            });
            updateGeometrySuggestions();
        });

        vm.removeFromList = function(index) {
            vm.geometryOptions.splice(index, 1);
            vm.apply();
        };

        vm.addToList = function(index, geom) {
            vm.hasCoordinate = true;
            addGeometryOption(vm.geometryOptions, geom.q, true);
            if (geom.valid) {
                addGeometrySuggestion(geom.q);
            }
            vm.apply();
        };
    }
}

module.exports = filterLocationDirective;

var wktformat = new /* ol.format. */WKT();
var geojsonformat = new /* ol.format. */GeoJSON();

function parseStringToWKTs(str, toastService) {
    var i, geojson, feature, isSimplified, orderChanged, wktGeom, wktGeometries = [];
    // assume geojson
    try {
        var geojsonGeometry = JSON.parse(str);
        geojson = geojsonformat.readFeatures(geojsonGeometry);
        for (i = 0; i < geojson.length; i++) {
            feature = geojson[i].getGeometry();
            wktGeom = wktformat.writeGeometry(feature);
            wktGeom = getRightHandCorrectedWKT(wktGeom, true);
            var parsedWkt = getAsValidWKT(wktGeom, toastService);
            if (!parsedWkt.failed) {
                isSimplified = parsedWkt.isSimplified;
                orderChanged = parsedWkt.orderChanged;
                wktGeometries.push(parsedWkt.wkt);
            } else {
                return {
                    error: 'NOT_VALID_WKT'
                };
            }
        }
    } catch (e) {
        // not a json object. try to parse as wkt
        try {
            var parsedWkt = getAsValidWKT(str, toastService);
            if (!parsedWkt.failed) {
                isSimplified = parsedWkt.isSimplified;
                orderChanged = parsedWkt.orderChanged;
                wktGeometries.push(parsedWkt.wkt);
            } else {
                return {
                    error: 'NOT_VALID_WKT'
                };
            }
        } catch (err) {
            return {
                error: 'FAILED_PARSING'
            };
        }
    }
    return {
        geometry: wktGeometries,
        isSimplified: isSimplified,
        orderChanged: orderChanged
    };
}

function testWktForIntersections(str) {
    try {
        // check for kinks, if not empty then throw error
        var feature = wktformat.readFeature(str);
        var testGeoJSon = geojsonformat.writeFeature(feature, {rightHanded: true});
        var kinks = turf.kinks(JSON.parse(testGeoJSon));
        if (kinks.features.length > 0) {
            return {
                selfIntersecting: true
            };
        }
    } catch (err) {
        return {
            error: 'FAILED_PARSING'
        };
    }
    return {
        selfIntersecting: false
    };
}

function getAsValidWKT(testWkt, toastService) {
    try {
        var simplifiedWkt = formatWkt(testWkt);
        var counterClockwiseWkt = getRightHandCorrectedWKT(simplifiedWkt);
        // if starting with GEOMETRYCOLLECTION then fail
        if (counterClockwiseWkt.indexOf('GEOMETRYCOLLECTION') === 0) {
            if (toastService) {
                toastService.warning({translate: 'occurrenceSearch.geometryCollectionNotSupported'});
            }
            return {failed: true};
        }
        return {
            failed: false,
            isSimplified: simplifiedWkt !== testWkt,
            orderChanged: counterClockwiseWkt !== simplifiedWkt,
            wkt: counterClockwiseWkt
        };
    } catch (err) {
        return {failed: true};
    }
}

function isValidWKT(testWKT) {
    try {
        testWKT = formatWkt(testWKT);
        var newWkt = getRightHandCorrectedWKT(testWKT);
        return testWKT === newWkt;
    } catch (err) {
        return false;
    }
}

function formatWkt(wktStr) {
    var f = wktformat.readFeature(wktStr);
    return wktformat.writeFeature(f, {decimals: 5});
}

function getRightHandCorrectedWKT(wktStr) {
    var f = wktformat.readFeature(wktStr);
    var asGeoJson = geojsonformat.writeFeature(f, {rightHanded: true});
    var rightHandCorrectedFeature = geojsonformat.readFeature(asGeoJson);
    var newWkt = wktformat.writeFeature(rightHandCorrectedFeature, {
        rightHanded: true, 
        decimals: 5
    });
    return newWkt;
}
