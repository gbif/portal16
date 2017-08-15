'use strict';

var angular = require('angular'),
    mapController = require('./map'),
    utils = require('../../../shared/layout/html/utils/utils'),
//globeCreator = require('./globe'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('adhocMap', adhocMapDirective);

/** @ngInject */
function adhocMapDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/map/adhocMap/adhocMap.html?v=' + BUILD_VERSION,
        scope: {
            filter: '=',
            mapStyle: '=',
            mapEvents: '='
        },
        link: mapLink,
        controller: adhocMap,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {//, attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function adhocMap($scope, $timeout, enums, $httpParamSerializer, OccurrenceSearch) {
        var vm = this;
        vm.styleBreaks = {
            breakpoints: [0, 700],
            classes: ['adhocMapSmall', 'adhocMapLarge']
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
            SQUARE_DOTS: {
                baseMap: {style: 'gbif-light'},
                overlay: [{style: 'outline.poly', bin: 'square', squareSize: 256}, {
                    style: 'orange.marker',
                    bin: 'square',
                    squareSize: 256
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
                overlay: [{style: 'green2.poly', bin: 'hex', hexPerTile: 15}],
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

            map.on('singleclick', function (e) {
                var coordinate = map.getProjectedCoordinate(e.coordinate);
                var size = 150;
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

        vm.setStyle = function (style) {
            var s = vm.styles[style] || vm.styles.CLASSIC;
            vm.widgetContextStyle = {
                background: s.background
            };
            map.update(s);
        };

        vm.updateFilters = function () {
            map.update({filters: getQuery()});
        };

        vm.toggleControl = function (control) {
            if (vm.activeControl == control) {
                vm.activeControl = 0;
            } else {
                vm.activeControl = control;
            }
        };

        vm.getClickedQuery = function () {
            var q = getQuery();
            q.geometry = vm.clickedGeometry;
            q.has_coordinate = true;
            q = _.mapKeys(q, function (value, key) {
                return _.snakeCase(key);
            });
            return $httpParamSerializer(q);
        };

        function getQuery() {
            var query = _.assign({}, vm.filter);
            query = _.mapKeys(query, function (value, key) {
                return _.camelCase(key);
            });
            return query;
        }

        vm.addSpatialFilter = function() {
            vm.mapEvents.filterChange(_.assign({}, vm.filter, {has_geospatial_issue: false, has_coordinate: true}));
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

        $scope.$watchCollection(function () {
            return vm.filter
        }, function () {
            map.update({filters: getQuery()});
        });
    }
}

module.exports = adhocMapDirective;
