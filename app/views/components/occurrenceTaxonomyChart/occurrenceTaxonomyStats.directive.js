'use strict';

var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .directive('occurrenceTaxonomyStats', occurrenceTaxonomyStats);

/** @ngInject */
function occurrenceTaxonomyStats(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/components/occurrenceTaxonomyChart/occurrenceTaxonomyStats.html?v=' + BUILD_VERSION,
        controller: occurrenceTaxonomyStats,
        link: chartLink,
        controllerAs: 'occurrenceTaxonomyStats',
        bindToController: {
            filter: '='
        }
    };
    return directive;

    /** @ngInject */
    function chartLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function occurrenceTaxonomyStats(Highcharts, OccurrenceTaxonomyChart, $state, $scope, OccurrenceFilter) {
        var vm = this;
        vm.loading = true;
        vm.chartType = 'sunburst';
        $scope.create = function(element) {
            vm.chartElement = element[0].querySelector('.taxonomyStatsContainer');
        };
        var query = vm.filter;

        $scope.$watchCollection(function() {
            return vm.filter;
        }, function() {
            if (_.get(vm.taxonomy, '$cancelRequest')) {
                vm.taxonomy.$cancelRequest();
            }
            angular.element(document).ready(function() {
                displayTree();
            });
        });

        vm.search = function(taxonKey, rank) {
            if ($state.current.parent == 'occurrenceSearch') {
                if ( !isNaN(parseInt(taxonKey))) {
                    OccurrenceFilter.updateParam('taxon_key', [taxonKey]);
                }
            } else {
                var filter = vm.filter || {};
                if (rank === 'GENUS') {
                    var q = _.merge({}, filter, {taxon_key: taxonKey});
                    $state.go('occurrenceSearchTable', q);
                } else if (rank === 'ORDER') {
                    vm.filter.taxon_key = taxonKey;
                }
            }
        };


        function displayTree() {
            vm.loading = true;
            vm.error = false;
            vm.taxonomy = OccurrenceTaxonomyChart.query(query);
            vm.taxonomy.$promise
                .then(function(taxonomy) {
                    vm.loading = false;
                    vm.preparing = true;

                    vm.chart = paintChart(Highcharts, vm.chartElement, vm.chartType, taxonomy, function() {
                        var splittedKey = this.id.split('.');
                        vm.search(splittedKey[1], this.rank);
                    });
                    vm.preparing = false;
                })
                .catch(function() {
                    vm.loading = false;
                    vm.preparing = false;
                    vm.error = true;
                });
        }


        // create API
        vm.api = {};
        vm.api.print = function() {
            vm.chart.print();
        };
        vm.api.png = function() {
            vm.chart.exportChart();
        };
        vm.api.svg = function() {
            vm.chart.exportChart({
                type: 'image/svg+xml'
            });
        };
        vm.api.asSunburst = function() {
            vm.chartType = 'sunburst';
            displayTree();
        };
        vm.api.asTreemap = function() {
            vm.chartType = 'treemap';
            displayTree();
        };
        if (Object.freeze) {
            Object.freeze(vm.api);
        }
    }
}

function paintChart(Highcharts, elm, type, taxonomy, click) {
    if (!type) {
        type = 'sunburst';
    }

    var options = {

        plotOptions: {
            sunburst: {
                size: '100%'
            }
        },
        boost: {
            useGPUTranslations: true
        },
        credits: false,
        title: {
            text: ''
        },
        exporting: {
            buttons: {
                contextButton: {
                    enabled: false
                }
            }
        },
        series: [{
            type: type,
            turboThreshold: 0,
            data: taxonomy,
            allowDrillToNode: true,
            boostThreshold: 5000,
            cursor: 'pointer',

            dataLabels: {
                format: '{point.name}',
                filter: {
                    property: 'innerArcLength',
                    operator: '>',
                    value: 16
                }
            },
            levels: [{
                level: 2,
                colorByPoint: true,
                dataLabels: {
                    rotationMode: 'parallel'
                }
            },
                {
                    level: 3,
                    colorVariation: {
                        key: 'brightness',
                        to: -0.5
                    }
                }, {
                    level: 4,
                    colorVariation: {
                        key: 'brightness',
                        to: 0.5
                    }
                }]

        }],
        tooltip: {
            headerFormat: '',
            pointFormat: '<b>{point.name} : {point.value}</b> occurrences'
        }
    };

    if (click && typeof click === 'function') {
        options.series[0].point ={
            events: {
                click: click
            }
        };
    }
   return Highcharts.chart(elm, options);
}

module.exports = occurrenceTaxonomyStats;

