'use strict';

var angular = require('angular'),
    mapController = require('./map'),
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
            datasetKey: '='
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
    function mapWidget($scope, enums) {
        var vm = this;
        vm.projections = {
            ARCTIC: 'EPSG_3575',
            MERCATOR: 'EPSG_3857',
            PLATE_CAREE: 'EPSG_4326',
            ANTARCTIC: 'EPSG_3031'
        };
        vm.activeControl = undefined;
        vm.controls = {
            PROJECTION: 1,
            BOR: 2,
            STYLE: 3
        };
        vm.styles = {
            CLASSIC: {
                baseMap: {style: 'gbif-classic'},
                overlay: []
            },
            LIGHT: {
                baseMap: {style: 'gbif-light'},
                overlay: [{style: 'outline.poly', bin: 'hex', hexPerTile: 15}, {style: 'orange.marker', bin: 'hex', hexPerTile: 15}]
            }
        };
        vm.basisOfRecord = {};
        enums.basisOfRecord.forEach(function (bor) {
            vm.basisOfRecord[bor] = false;
        });
        var map;

        vm.allYears = true;
        vm.yearRange = {};

        $scope.create = function (element) {
            map = mapController.createMap(element, {baseMap: {style: 'gbif-dark'}, filters: {basisOfRecord: 'HUMAN_OBSERVATION', taxonKey: 212}});

            var slider = element[0].querySelector('.time-slider__slider');
            var years = element[0].querySelector('.time-slider__years');

            noUiSlider.create(slider, {
                start: [1700, 2016],
                step: 1,
                connect: true,
                range: {
                    'min': 1700,
                    'max': 2016
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
        };

        vm.setStyle = function(style){
            map.update(style);
        };

        vm.restyle2 = function(){
            map.update({baseMap: {style: 'gbif-light'}, overlay: [{style: 'outline.poly', bin: 'hex', hexPerTile: 15}, {style: 'orange.marker', bin: 'hex', hexPerTile: 15}]});
        };

        vm.setProjection = function(epsg){
            map.update({projection: epsg});
        };

        vm.setFilters = function(){
            map.update({filters: {basisOfRecord: 'HUMAN_OBSERVATION', taxonKey: 18}});
        };

        vm.updateFilters = function(){
            map.update({filters: getQuery()});
        };

        vm.clearFilters = function(){
            map.update({filters: {}});
        };

        vm.toggleControl = function(control) {
            vm.activeControl = control;
        };

        function getQuery() {
            var query = {};
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
    }
}

module.exports = mapWidgetDirective;
