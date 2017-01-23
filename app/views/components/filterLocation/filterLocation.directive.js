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
    function filterLocation($scope, $filter, OccurrenceFilter) {
        var vm = this;
        vm.title = vm.filterConfig.title;
        vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        vm.translationPrefix = vm.filterConfig.translationPrefix || vm.filterConfig.title;
        vm.filterAutoUpdate = vm.filterConfig.filterAutoUpdate !== false;
        vm.collapsed = vm.filterConfig.collapsed !== false;

        vm.tester = $filter('unique')(vm.filterState.query[vm.queryKey]);


        vm.addString = function() {
            console.log('parse');
            var leafletGeoJson, wktGeometries = [];
            //assume geojson
            try {
                var geojsonGeometry = JSON.parse(vm.geometryString);
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
                    geojsonGeometry = parseGeometry(vm.geometryString);
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
                }
            }

            vm.query = wktGeometries;
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
        });

        vm.change = function (e, checked) {
            if (vm.filterAutoUpdate) {
                if (checked) {
                    vm.query.push(e);
                } else {
                    vm.query.splice(vm.query.indexOf(e), 1);
                }
                vm.apply();
            }
        };

        vm.uncheckAll = function () {

        };
        vm.apply = function () {
            console.log('apply');
            OccurrenceFilter.updateParam(vm.queryKey, vm.query);
        }
    }
}

module.exports = filterLocationDirective;
