'use strict';

var angular = require('angular'),
    mapController = require('./map'),
    utils = require('../../../shared/layout/html/utils/utils'),
//globeCreator = require('./globe'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('mapWidget', mapWidgetDirective);

/** @ngInject */
function mapWidgetDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/map/mapWidget/mapWidget.html?v=' + BUILD_VERSION,
        scope: {
            filter: '=',
            mapStyle: '='
        },
        link: mapLink,
        controller: mapWidget,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {//, attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function mapWidget($scope, $timeout, enums, $httpParamSerializer, MapCapabilities, OccurrenceSearch) {
        var vm = this;
        vm.styleBreaks = {
            breakpoints: [0, 700],
            classes: ['isSmall', 'isLarge']
        };
        vm.projections = {
            ARCTIC: 'EPSG_3575',
            MERCATOR: 'EPSG_3857',
            PLATE_CAREE: 'EPSG_4326',
            ANTARCTIC: 'EPSG_3031'
        };
        vm.activeProjection = vm.projections.PLATE_CAREE;
        vm.activeControl = undefined;
        vm.controls = {
            PROJECTION: 1,
            BOR: 2,
            STYLE: 3,
            YEAR: 4,
            OCCURRENCES: 5
        };
        vm.styles = {
            CLASSIC: {
                baseMap: {style: 'gbif-classic'},
                overlay: [],
                background: '#02393d'
            },
            ORANGE_DOTS: {
                baseMap: {style: 'gbif-light'},
                overlay: [{style: 'outline.poly', bin: 'hex', hexPerTile: 15}, {
                    style: 'orange.marker',
                    bin: 'hex',
                    hexPerTile: 15
                }],
                background: '#e0e0e0'
            },
            OSM: {
                baseMap: {style: 'osm-bright'},
                overlay: [{style: 'outline.poly', bin: 'hex', hexPerTile: 15}, {
                    style: 'orange.marker',
                    bin: 'hex',
                    hexPerTile: 15
                }],
                background: '#e0e0e0'
            },
            GREEN: {
                baseMap: {style: 'gbif-light'},
                overlay: [{style: 'green2.poly', bin: 'hex', hexPerTile: 25}],
                background: '#e0e0e0'
            },
            DARK: {
                baseMap: {style: 'gbif-dark'},
                overlay: [],
                background: '#272727'
            }
        };
        vm.styleOptions = Object.keys(vm.styles);
        vm.basisOfRecord = {};
        enums.basisOfRecord.forEach(function (bor) {
            vm.basisOfRecord[bor] = false;
        });
        var map;

        vm.allYears = true;
        vm.yearRange = {};

        $scope.create = function (element) {
            var suggestedStyle = vm.styles[_.get(vm.mapStyle, 'suggested', 'CLASSIC')] || vm.styles.CLASSIC;
            vm.style = _.get(vm.mapStyle, 'suggested', 'CLASSIC');
            vm.widgetContextStyle = {
                background: suggestedStyle.background
            };
            map = mapController.createMap(element, {
                baseMap: suggestedStyle.baseMap,
                overlay: suggestedStyle.overlay,
                filters: getQuery()
            });

            var query = _.assign({}, vm.filter);
            query = _.mapKeys(query, function (value, key) {
                return _.camelCase(key);
            });
            vm.capabilities = MapCapabilities.get(query);
            vm.capabilities.$promise.then(function (response) {
                map.setExtent([response.minLng-1, response.minLat-1, response.maxLng+1, response.maxLat+1]);//expand with one degree as the API sometimes crop away content see https://github.com/gbif/maps/issues/17
                //only create the slider if there are any years in the data to filter on
                if (response.maxYear) {
                    createSlider(element, response.minYear, response.maxYear);
                }
            }).catch(function () {
                createSlider(element);
            });

            map.on('moveend', function () {
                $timeout(function () {
                    vm.viewBbox = map.getViewExtent();
                    vm.viewBboxWidth = vm.viewBbox[2] - vm.viewBbox[0];
                }, 0);
            });

            map.on('singleclick', function (e) {
                var coordinate = map.getProjectedCoordinate(e.coordinate);
                var size = 7;
                var onePixelOffset = map.getProjectedCoordinate(map.map.getCoordinateFromPixel([e.pixel[0] + size, e.pixel[1] + size]));
                var offset = Math.min(2, Math.max(Math.abs(onePixelOffset[0] - coordinate[0]), Math.abs(onePixelOffset[1] - coordinate[1])));//lazy failsafe for those odd cases in polar projections
                while (_.isNumber(coordinate[0]) && coordinate[0] < -180) {
                    coordinate[0] = coordinate[0] + 360;
                }
                while (_.isNumber(coordinate[0]) && coordinate[0] > 180) {
                    coordinate[0] = coordinate[0] - 360;
                }
                getOccurrencesInArea(coordinate[1], coordinate[0], offset);
            });
            //getOccurrencesInArea(47.3515625, 2.8125, 1);
        };

        function createSlider(element, startYear, endYear) {
            startYear = startYear || 1700;
            endYear = endYear || 2017;
            var slider = element[0].querySelector('.time-slider__slider');
            var years = element[0].querySelector('.time-slider__years');

            noUiSlider.create(slider, {
                start: [startYear, endYear],
                step: 1,
                connect: true,
                range: {
                    'min': startYear,
                    'max': endYear
                }
            });
            slider.noUiSlider.on('update', function (vals) {
                // only adjust the range the user can see
                vm.yearRange.start = Math.floor(vals[0]);
                vm.yearRange.end = Math.floor(vals[1]);
                years.innerText = vm.yearRange.start + " - " + vm.yearRange.end;
            });
            slider.noUiSlider.on('start', function () {
                $scope.$apply(function () {
                    vm.allYears = false;
                });
            });
            slider.noUiSlider.on('change', vm.sliderChange);
        }

        vm.setStyle = function (style) {
            var s = vm.styles[style] || vm.styles.CLASSIC;
            vm.widgetContextStyle = {
                background: s.background
            };
            map.update(s);
        };

        vm.setProjection = function (epsg) {
            map.update({projection: epsg});
        };

        vm.setFilters = function () {
            map.update({filters: {basisOfRecord: 'HUMAN_OBSERVATION', taxonKey: 18}});
        };

        vm.updateFilters = function () {
            map.update({filters: getQuery()});
        };

        vm.clearFilters = function () {
            map.update({filters: {}});
        };

        vm.toggleControl = function (control) {
            if (vm.activeControl == control) {
                vm.activeControl = 0;
            } else {
                vm.activeControl = control;
            }
        };

        vm.toggleFullscreen = function() {
            vm.fullscreen = !vm.fullscreen;
            $timeout(function(){
                map.map.updateSize();
                map.map.render();
            }, 0);
        };

        vm.getProjection = function () {
            return map ? map.getProjection() : undefined;
        };

        vm.getExploreQuery = function () {
            var q = getQuery();
            if (map && map.getProjection() == 'EPSG_4326') {
                q.geometry = getBoundsAsQueryString();
                q.has_coordinate = true;
                q.has_geospatial_issue = false;
            }
            q = _.mapKeys(q, function (value, key) {
                return _.snakeCase(key);
            });
            return $httpParamSerializer(q);
        };

        vm.getClickedQuery = function () {
            var q = getQuery();
            q.geometry = vm.clickedGeometry;
            q.has_coordinate = true;
            q.has_geospatial_issue = false;
            q = _.mapKeys(q, function (value, key) {
                return _.snakeCase(key);
            });
            return $httpParamSerializer(q);
        };

        /**
         * Make sure that longitude coordinates are within the bounds of the map (dateline wrapping).
         * @param n
         * @returns {number} within the -180 to 180 bounds. -200 will fx wrap to 160
         */
        function normalizeLng(extent) {
            while (_.isNumber(extent[2]) && extent[2] < -180) {
                extent[0] = extent[0] + 360;
                extent[2] = extent[2] + 360;
            }
            return extent;
        }

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
         * Get the bounds of the map as wkt string.
         * @returns {string} format 'POLYGON((W S,W N,E N,E S,W S))'
         */
        function getBoundsAsQueryString() {
            if (!map) return;
            var extent = map.getViewExtent();
            extent = normalizeLng(extent);
            var N = capBounds(extent[3]),
                S = capBounds(extent[1]),
                W = extent[0],
                E = extent[2];

            var str = 'POLYGON' + '((W S,W N,E N,E S,W S))'
                    .replace(/N/g, N.toFixed(2))
                    .replace(/S/g, S.toFixed(2))
                    .replace(/W/g, W.toFixed(2))
                    .replace(/E/g, E.toFixed(2));
            //if we are seeing all of earth then do not filter on bounds. TODO, this will be different code for other projections. How to handle that well?
            if (Math.abs(E - W) >= 180) {
                str = undefined;
            }
            return str;
        }

        function getQuery() {
            var query = _.assign({}, vm.filter);
            query = _.mapKeys(query, function (value, key) {
                return _.camelCase(key);
            });
            if (!vm.allYears && vm.yearRange.start && vm.yearRange.end) {
                query.year = vm.yearRange.start + "," + vm.yearRange.end;
            }
            //basis of record as array
            var basisOfRecord = Object.keys(vm.basisOfRecord).filter(function (e) {
                return vm.basisOfRecord[e];
            });
            query.basisOfRecord = basisOfRecord;
            if (basisOfRecord.length == 0 || basisOfRecord.length == Object.keys(vm.basisOfRecord).length) {
                delete query.basisOfRecord;
            }
            return query;
        }

        vm.sliderChange = function (vals) {
            vm.yearRange.start = Math.floor(vals[0]);
            vm.yearRange.end = Math.floor(vals[1]);
            vm.updateFilters();
            $scope.$apply(function () {
                vm.allYears = false;
            });
        };

        vm.mapMenu = {};
        vm.clickedQuery = {};
        vm.clickedGeometry;
        function getOccurrencesInArea(lat, lng, offset) {
            if (vm.occurrenceRequest && vm.occurrenceRequest.$cancelRequest) vm.occurrenceRequest.$cancelRequest();

            vm.clickedQuery = getQuery();
            var decimalLatitudeMin = lat - offset;
            var decimalLatitudeMax = lat + offset;
            var decimalLongitudeMin = lng - offset;
            var decimalLongitudeMax = lng + offset;
            vm.clickedGeometry =  'POLYGON' + '((W S,W N,E N,E S,W S))'
                    .replace(/N/g, decimalLatitudeMin)
                    .replace(/S/g, decimalLatitudeMax)
                    .replace(/W/g, decimalLongitudeMin)
                    .replace(/E/g, decimalLongitudeMax);

            decimalLatitudeMin = Math.max(-90, decimalLatitudeMin);
            decimalLongitudeMin = Math.max(-180, decimalLongitudeMin);
            decimalLatitudeMin = Math.min(90, decimalLatitudeMin);
            decimalLongitudeMin = Math.min(180, decimalLongitudeMin);

            decimalLatitudeMax = Math.min(90, decimalLatitudeMax);
            decimalLongitudeMax = Math.min(180, decimalLongitudeMax);
            decimalLatitudeMax = Math.max(-90, decimalLatitudeMax);
            decimalLongitudeMax = Math.max(-180, decimalLongitudeMax);

            vm.clickedQuery.decimalLatitude = decimalLatitudeMin + ',' + decimalLatitudeMax;
            vm.clickedQuery.decimalLongitude = decimalLongitudeMin + ',' + decimalLongitudeMax;
            vm.clickedQuery.has_geospatial_issue = false;
            vm.activeControl = vm.controls.OCCURRENCES;
            vm.mapMenu.isLoading = true;
            vm.occurrenceRequest = OccurrenceSearch.query(vm.clickedQuery, function (data) {
                utils.attachImages(data.results);
                vm.mapMenu.isLoading = false;
                vm.mapMenu.occurrences = data;
            }, function () {
                //TODO error handling
            });
        }
    }
}

module.exports = mapWidgetDirective;
