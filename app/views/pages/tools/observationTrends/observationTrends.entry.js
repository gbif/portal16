'use strict';

var _ = require('lodash');
var mapHelper = require('./map');
var chart = require('./chart');
var wellknown = require('wellknown');
window.Chartist = require('chartist');
require('angular-chartist.js');
require('chartist-plugin-axistitle');

angular
    .module('portal')
    .controller('observationTrendsCtrl', observationTrendsCtrl);

/** @ngInject */
function observationTrendsCtrl($scope, $http, constantKeys, suggestEndpoints, $httpParamSerializer, env, OccurrenceSearch, Regression) {
    var vm = this;
    vm.lowerTaxon;
    vm.loading = false;
    vm.higherTaxonArray = [];
    vm.slopeStdErrThreshold = 1;
    vm.minimumYears = '10';
    vm.suggestTemplate = '/templates/components/filterTaxon/suggestTaxonTemplate.html';
    vm.yearRange = {};
    vm.hexagonMode = true;
    vm.isActive = false;
    vm.mapTool = {
        info: false,
        style: false
    };
    vm.selectedArea = {
        apiData: {}
    };
    vm.regressionQuery = {};

    vm.toggleMapTool = function(tool) {
        // toggle key
        vm.mapTool[tool] = !vm.mapTool[tool];
        // close other items
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
        if (vm.regressionQuery.$cancelRequest) {
            vm.regressionQuery.$cancelRequest();
            vm.loading = false;
        }
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
        vm.geometry = undefined;
        mapHelper.clearSelection(vm.hexagonMode);
    };

    vm.tableData = {
        years: [],
        groupCounts: [],
        speciesCounts: []
    };

    var maxYear = new Date().getFullYear();
    var startYear = maxYear - 2;
    vm.sliderOptions = {
        start: [1970, startYear],
        range: {
            'min': [1900, 1],
            '50%': [1970, 1],
            'max': [maxYear]
        },
        format: {
            to: function(value) {
                return parseInt(value);
            },
            from: function(value) {
                return parseInt(value);
            }
        },
        step: 1,
        connect: true
    };

    vm.eventHandlers = {
        update: function(values) { // handle, unencoded
            vm.yearRange.start = Math.floor(values[0]);
            vm.yearRange.end = Math.floor(values[1]);
        },
        change: function(values) { // values, handle, unencoded
            vm.yearRange.start = Math.floor(values[0]);
            vm.yearRange.end = Math.floor(values[1]);
            vm.updateMap();
            getRegression();
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
        }, function(response) {
            vm.lowerTaxon.countSince1900 = response.count;
        }, function() {
            // TODO handle API errors
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

    vm.getSuggestions = function(val) {
        return $http.get(suggestEndpoints.taxon, {
            params: {
                q: val.toLowerCase(),
                limit: 10,
                datasetKey: constantKeys.dataset.backbone
            }
        }).then(function(response) {
            return response.data;
        });
    };

    vm.updateMap = function() {
        var year;
        var taxonKey = _.get(vm, 'lowerTaxon.key'),
            higherKey = _.get(vm, 'higherTaxon.key');
        if (!taxonKey || !higherKey) {
            mapHelper.removeOverlays();
        } else {
            if (vm.yearRange.start || vm.yearRange.end) {
                year = (vm.yearRange.start || '*' ) + ',' + (vm.yearRange.end || '*');
            }
            var query = $httpParamSerializer(
                {
                    taxonKey: taxonKey,
                    higherTaxonKey: higherKey,
                    minYears: vm.minimumYears,
                    year: year
                }
            );
            mapHelper.updateOverlays(query, vm.slopeStdErrThreshold);
        }
    };

    vm.updateHigherTaxon = function() {
        vm.clearSelection();
        vm.updateMap();
    };

    vm.setLowerTaxon = function(item) {
        // if nothing selected then do not do anything
        if (angular.isUndefined(item)) return;
        vm.clearSelection();
        vm.lowerTaxon = item;

        if (item.rank == 'KINGDOM') {
            // it doesn't make sense to choose a kingdom. And maybe we should even set the bar lower
            return;
        } else {
            vm.getTotalSpeciesCountInTimeSpan();
            // transform higherClassificationMap to array and sort it by key. select largest key - the assumption being that it is the lowest rank
            var higherArray = _.map(vm.lowerTaxon.higherClassificationMap, function(name, key) {
                return {key: parseInt(key), name: name};
            });
            higherArray = _.sortBy(higherArray, 'key');
            vm.higherTaxonArray = higherArray;

            if (higherArray.length >= 5) {
                vm.higherTaxon = higherArray[4];
            } else {
                vm.higherTaxon = higherArray[higherArray.length - 1];
            }

            // update the map to reflect the new selection
            vm.updateMap();
        }
    };

    function getPolygonAsWKT(geometry) {
        return wellknown.stringify(geometry);
    }

    vm.applyUpdateResults = function(properties) {
        $scope.$apply(function() {
            vm.isActive = true;
            transformData(properties);
            vm.selectedArea.apiData = properties;
            chart.showStats(properties, vm.yearRange.start, vm.yearRange.end); // TODO use angular charist directive instead
        });
    };

    vm.updateResults = function(properties) {
        transformData(properties);
        vm.selectedArea.apiData = properties;
        chart.showStats(properties, vm.yearRange.start, vm.yearRange.end); // TODO use angular charist directive instead
    };

    function getRegression() {
        var year,
            taxonKey = _.get(vm, 'lowerTaxon.key'),
            higherKey = _.get(vm, 'higherTaxon.key');
        if (vm.yearRange.start || vm.yearRange.end) {
            year = (vm.yearRange.start || '*' ) + ',' + (vm.yearRange.end || '*');
        }

        if (taxonKey && higherKey && year && vm.geometry) {
            var query = {
                higherTaxonKey: vm.higherTaxon.key,
                taxonKey: vm.lowerTaxon.key,
                minYears: vm.minimumYears,
                year: year,
                geometry: vm.geometry
            };

            vm.clear();
            vm.loading = true;
            vm.regressionQuery = Regression.query(query, function(response) {
                vm.updateResults(response);
                vm.loading = false;
            }, function(err) {
                if (err.status === -1) {
                    // canceled request do nothing
                } else {
                    vm.clearSelection();
                    vm.loading = false;
                    alert('We couldn\'t process your query. Be aware that geometries may not overlap with them self');
                }
            });
        }
    }

    mapHelper.createMap(
        {
            dataapiv2: env.dataApiV2,
            onStyleLoad: function() {
                vm.startHexagon();
            }
        }
    );

    mapHelper.addMapEvents({
        onCreate: function(e) {
            vm.geometry = getPolygonAsWKT(e.features[0].geometry);
            getRegression();
            vm.isActive = true;// show drawer after having drawn
        },
        onUpdate: function(e) {
            vm.geometry = getPolygonAsWKT(e.features[0].geometry);
            getRegression();
        },
        onDelete: function() {
        },
        onHexagonSelect: function(properties, feature) {
            if (vm.regressionQuery.$cancelRequest) {
                vm.regressionQuery.$cancelRequest();
                vm.loading = false;
            }
            vm.geometry = getPolygonAsWKT(feature.geometry);
            vm.applyUpdateResults(properties);
        }
    });
}


module.exports = observationTrendsCtrl;
