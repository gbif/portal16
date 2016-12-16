'use strict';

var _ = require('lodash');
var mapHelper = require('./map');
var chart = require('./chart');
var wellknown = require('wellknown');

angular
    .module('portal')
    .controller('speciesPopulationCtrl', speciesPopulationCtrl);

/** @ngInject */
function speciesPopulationCtrl($scope, $http, suggestEndpoints, $httpParamSerializer) {
    var vm = this;
    vm.lowerTaxon;
    vm.higherTaxonArray = [];
    vm.minimumYears = '10';
    vm.suggestTemplate = '/templates/components/filterTaxon/suggestTaxonTemplate.html';
    vm.yearRange = {};
    vm.hexagonMode = true;
    vm.selectedArea = {
        apiData: {}
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
        start: [1900, 2017],
        range: {
            'min': [1900, 1],
            '50%': [1970, 1],
            'max': [2016]
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
        //slide: function (values) { //values, handle, unencoded
        //    console.log(values);
        //},
        //set: function(values, handle, unencoded) {
        //},
        change: function (values) { //values, handle, unencoded
            vm.yearRange.start = Math.floor(values[0]);
            vm.yearRange.end = Math.floor(values[1]);
            vm.updateMap();
        }
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
        mapHelper.updateOverlays(query);
    };

    vm.setLowerTaxon = function (item) {
        //if nothing selected then do not do anything
        if (angular.isUndefined(item)) return;
        vm.lowerTaxon = item;

        if (item.rank == 'KINGDOM') {
            //it doesn't make sense to choose a kingdom. And maybe we should even set the bar lower
            return;
        } else {

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
            chart.showStats(properties); //TODO use angular charist directive instead
        });
    };

    vm.updateResults = function(properties) {
        transformData(properties);
        vm.selectedArea.apiData = properties;
        chart.showStats(properties); //TODO use angular charist directive instead
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
        $http.get('//api.gbif-uat.org/v2/map/occurrence/regression?' + query, {}).then(function(response){
            vm.updateResults(response.data);
        }, function(err){
            vm.clearSelection();
            alert('We couldn\'t process your query. Be aware that geometries may not overlap with them self');
        });
    }

    mapHelper.createMap(
        {
            onStyleLoad: function(){
                vm.updateMap();
                vm.startHexagon();
            }
        }
    );
    mapHelper.addMapEvents({
        onCreate: function(e) {
            console.log('draw creation event triggered from directive');
            vm.geometry = getPolygonAsWKT(e.features[0].geometry);
            getRegression();
        },
        onUpdate: function(e) {
            console.log('drawn polygon updates');
            vm.geometry = getPolygonAsWKT(e.features[0].geometry);
            getRegression();
        },
        onDelete: function(e) {
            console.log('draw deletion');
        },
        onHexagonSelect: function(properties, feature) {
            console.log('hexagon selected');
            vm.applyUpdateResults(properties);
        }
    });

}


module.exports = speciesPopulationCtrl;
