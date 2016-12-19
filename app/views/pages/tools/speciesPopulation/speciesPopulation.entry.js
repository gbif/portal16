'use strict';

var _ = require('lodash');
var mapHelper = require('./map');
var chart = require('./chart');
var wellknown = require('wellknown');

angular
    .module('portal')
    .controller('speciesPopulationCtrl', speciesPopulationCtrl);

/** @ngInject */
function speciesPopulationCtrl($scope, $http, suggestEndpoints, $httpParamSerializer, env, OccurrenceSearch) {
    var vm = this;
    vm.lowerTaxon;
    vm.loading = false;
    vm.higherTaxonArray = [];
    vm.slopeStdErrThreshold = 1;
    vm.minimumYears = '10';
    vm.suggestTemplate = '/templates/components/filterTaxon/suggestTaxonTemplate.html';
    vm.yearRange = {};
    vm.hexagonMode = true;
    vm.mapTool = {
        info: false,
        style: false
    };
    vm.selectedArea = {
        apiData: {}
    };

    vm.toggleMapTool = function(tool) {
        //toggle key
        vm.mapTool[tool] = !vm.mapTool[tool];
        //close other items
        for (var key in vm.mapTool) {
            if (vm.mapTool.hasOwnProperty(key)) {
                if (key != tool) {
                    vm.mapTool[key] = false;
                }
            }
        }
    };

    vm.clear = function() {
        vm.selectedArea.apiData = undefined;
        vm.tableData.years = [];
    };

    vm.startDraw = function() {
        vm.clear();
        mapHelper.startDraw();
        vm.hexagonMode = false;
    };

    vm.startHexagon = function() {
        vm.clear();
        mapHelper.startHexagonSelection();
        vm.hexagonMode = true;
    };

    vm.clearSelection = function() {
        vm.clear();
        mapHelper.clearSelection(vm.hexagonMode);
    };

    vm.tableData = {
        years: [],
        groupCounts: [],
        speciesCounts: []
    };

    vm.sliderOptions = {
        start: [1970, 2015],
        range: {
            'min': [1900, 1],
            '50%': [1970, 1],
            'max': [2017]
        },
        format: {
            to: function (value) {
                return parseInt(value)
            },
            from: function (value) {
                return parseInt(value)
            }
        },
        step: 1,
        connect: true
    };

    vm.eventHandlers = {
        update: function(values) { //handle, unencoded
            vm.yearRange.start = Math.floor(values[0]);
            vm.yearRange.end = Math.floor(values[1]);
        },
        change: function (values) { //values, handle, unencoded
            vm.yearRange.start = Math.floor(values[0]);
            vm.yearRange.end = Math.floor(values[1]);
            vm.updateMap();
            vm.getTotalSpeciesCountInTimeSpan();
        }
    };


    vm.getTotalSpeciesCountInTimeSpan = function() {
        if (!vm.lowerTaxon.key) {
            vm.lowerTaxon.countSince1900 = 0;
            return;
        }
        OccurrenceSearch.query({
            limit: 0,
            taxon_key: vm.lowerTaxon.key,
            has_coordinate: true,
            has_geospatial_issue: false,
            year: '1900,*'
        }, function(response){
            vm.lowerTaxon.countSince1900 = response.count;
        }, function(err){
        });
    };


    function transformData(data) {
        vm.tableData.speciesCounts = typeof data.speciesCounts === 'string' ? JSON.parse(data.speciesCounts) : data.speciesCounts;
        vm.tableData.groupCounts = typeof data.groupCounts === 'string' ? JSON.parse(data.groupCounts) : data.groupCounts;
        if (vm.tableData.groupCounts.length < vm.tableData.speciesCounts.length) {
            alert('Complain to Tim R - this shouldn\'t be possible');
        }
        vm.tableData.years = Object.keys(vm.tableData.groupCounts).sort();
    }

    vm.getSuggestions = function (val) {
        return $http.get(suggestEndpoints.taxon, {
            params: {
                q: val.toLowerCase(),
                limit: 10
            }
        }).then(function (response) {
            return response.data;
        });
    };

    vm.updateMap = function() {
        var year;
        if (vm.yearRange.start || vm.yearRange.end) {
            year = (vm.yearRange.start || '*' ) + ',' + (vm.yearRange.end || '*');
        }
        var query = $httpParamSerializer(
            {
                higherTaxonKey: _.get(vm, 'higherTaxon.key', 7017),
                taxonKey: _.get(vm, 'lowerTaxon.key', 1898286),
                minYears: vm.minimumYears,
                year: year
            }
        );
        mapHelper.updateOverlays(query, vm.slopeStdErrThreshold);
    };

    vm.updateHigherTaxon = function() {
        vm.clearSelection();
        vm.updateMap();
    };

    vm.setLowerTaxon = function (item) {
        //if nothing selected then do not do anything
        if (angular.isUndefined(item)) return;
        vm.clearSelection();
        vm.lowerTaxon = item;

        if (item.rank == 'KINGDOM') {
            //it doesn't make sense to choose a kingdom. And maybe we should even set the bar lower
            return;
        } else {
            vm.getTotalSpeciesCountInTimeSpan();
            //transform higherClassificationMap to array and sort it by key. select largest key - the assumption being that it is the lowest rank
            var higherArray = _.map(vm.lowerTaxon.higherClassificationMap, function (name, key) {
                return {key: parseInt(key), name: name};
            });
            higherArray = _.sortBy(higherArray, 'key');
            vm.higherTaxonArray = higherArray;

            if(higherArray.length >= 5) {
                vm.higherTaxon = higherArray[4];
            } else {
                vm.higherTaxon = higherArray[higherArray.length - 1];
            }

            //update the map to reflect the new selection
            vm.updateMap();
        }
    };

    function getPolygonAsWKT(geometry) {
        return wellknown.stringify(geometry);
    }

    vm.applyUpdateResults = function(properties) {
        $scope.$apply(function() {
            transformData(properties);
            vm.selectedArea.apiData = properties;
            chart.showStats(properties, vm.yearRange.start, vm.yearRange.end); //TODO use angular charist directive instead
        });
    };

    vm.updateResults = function(properties) {
        transformData(properties);
        vm.selectedArea.apiData = properties;
        chart.showStats(properties, vm.yearRange.start, vm.yearRange.end); //TODO use angular charist directive instead
    };

    function getRegression() {
        var year;
        if (vm.yearRange.start || vm.yearRange.end) {
            year = (vm.yearRange.start || '*' ) + ',' + (vm.yearRange.end || '*');
        }
        var query = $httpParamSerializer(
            {
                higherTaxonKey: vm.higherTaxon.key,
                taxonKey: vm.lowerTaxon.key,
                minYears: vm.minimumYears,
                year: year,
                geometry: vm.geometry
            }
        );
        vm.loading = true;
        vm.clear();
        $http.get(env.dataApiV2 + 'map/occurrence/regression?' + query, {}).then(function(response){
            vm.updateResults(response.data);
            vm.loading = false;
        }, function(err){
            vm.clearSelection();
            vm.loading = false;
            alert('We couldn\'t process your query. Be aware that geometries may not overlap with them self');
        });
    }

    mapHelper.createMap(
        {
            dataapiv2: env.dataApiV2,
            onStyleLoad: function(){
                vm.updateMap();
                vm.startHexagon();
            }
        }
    );

    mapHelper.addMapEvents({
        onCreate: function(e) {
            vm.geometry = getPolygonAsWKT(e.features[0].geometry);
            getRegression();
        },
        onUpdate: function(e) {
            vm.geometry = getPolygonAsWKT(e.features[0].geometry);
            getRegression();
        },
        onDelete: function(e) {
        },
        onHexagonSelect: function(properties, feature) {
            vm.applyUpdateResults(properties);
        }
    });

}


module.exports = speciesPopulationCtrl;
