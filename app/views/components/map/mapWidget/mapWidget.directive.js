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
    function mapWidget($scope) {
        var vm = this;
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

        vm.restyle = function(){
            map.update({baseMap: {style: 'gbif-dark'}, overlay: [{style: 'classic.poly', bin: 'hex', hexPerTile: 27}]});
        };

        vm.restyle2 = function(){
            map.update({baseMap: {style: 'gbif-dark'}, overlay: [{style: 'outline.poly', bin: 'hex', hexPerTile: 10}, {style: 'blue.marker', bin: 'hex', hexPerTile: 10}]});
        };

        vm.setProjection = function(epsg){
            map.update({projection: epsg});
        };

        vm.setFilters = function(){
            map.update({filters: {basisOfRecord: 'HUMAN_OBSERVATION', taxonKey: 18}});
        };

        vm.clearFilters = function(){
            map.update({filters: {}});
        };

        function getQuery() {
            var query = {};
            if (!vm.allYears && vm.yearRange.start && vm.yearRange.end) {
                query.year = vm.yearRange.start + "," + vm.yearRange.end;
            }
            return query;
        }

        vm.sliderChange = function (vals) {
            vm.yearRange.start = Math.floor(vals[0]);
            vm.yearRange.end = Math.floor(vals[1]);
            map.update({filters: getQuery()});
            $scope.$apply(function () {
                vm.allYears = false;
            });
        };
    }
}

module.exports = mapWidgetDirective;
