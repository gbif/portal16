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
            filter: '=',
            chartType: '='
        }
    };
    return directive;

    /** @ngInject */
    function chartLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function occurrenceTaxonomyStats(Highcharts, OccurrenceTaxonomyChart, $state, $scope, OccurrenceFilter, $timeout, $translate) {
        var vm = this;
        vm.loading = true;
        vm.chartType = vm.chartType || 'sunburst';
        $scope.create = function(element) {
            vm.chartElement = element[0].querySelector('.taxonomyStatsContainer');
        };
        var query = vm.filter;

        $scope.$watchCollection(function() {
            return vm.filter;
        }, function() {
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
            if (vm.taxonomy && !vm.taxonomy.$resolved && _.get(vm.taxonomy, '$cancelRequest')) {
                vm.taxonomy.$cancelRequest();
            }

            $timeout(function() {
                vm.taxonomy = OccurrenceTaxonomyChart.query(query);
                vm.taxonomy._loading = true;
                vm.taxonomy._error = false;
                vm.taxonomy.$promise
                    .then(function(res) {
                        vm.taxonomy._loading = false;
                        var allowDrillToNode = ($state.current.parent !== 'occurrenceSearch');
                         $translate('metrics.occurrences').then(function(result) {
                            vm.chart = paintChart(Highcharts, vm.chartElement, vm.chartType, res, allowDrillToNode, function() {
                                var splittedKey = this.id.split('.');
                                vm.search(splittedKey[1], this.rank);
                            }, result);
                        });
                    })
                    .catch(function(err) {
                        vm.taxonomy._loading = false;
                        vm.taxonomy._error = true;
                    });
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

function paintChart(Highcharts, elm, type, res, allowDrillToNode, click, translatedOccurrences) {
    if (!type) {
        type = 'sunburst';
    }
    var taxonomy = res.results;
    var minCountForTreeMapLabels = Math.round(res.count / 80);
    var sunBurstOptions = {

        plotOptions: {
            sunburst: {
                size: '100%'
            }
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
            type: 'sunburst',
            turboThreshold: 0,
            data: taxonomy,
            allowDrillToNode: allowDrillToNode,
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
                level: 1,
                levelIsConstant: false,
                dataLabels: {
                    enabled: true
                }
            },
            {
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
            pointFormat: '<b>{point.name} : {point.value}</b> ' + translatedOccurrences
        }
    };

    var treeMapOptions = {
        plotOptions: {
            sunburst: {
                size: '100%'
            }
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
            turboThreshold: 0,
            boostThreshold: 100,
            type: 'treemap',
            allowDrillToNode: allowDrillToNode,
            animationLimit: 1000,
            levelIsConstant: true,
            levels: [{
                level: 1,
                layoutAlgorithm: 'stripes',
                colorByPoint: true,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return (this.point.options.value > minCountForTreeMapLabels) ? this.point.name : false;
                    },
                    align: 'left',
                    verticalAlign: 'top',
                    style: {
                        fontSize: '16px',
                        fontWeight: 'bold'

                    },
                    padding: 2
                }
            },
            {
                level: 2,
                colorByPoint: true,
                layoutAlgorithm: 'sliceAndDice',
                dataLabels: {
                    enabled: res.levelCounts[2] < 300,
                    formatter: function() {
                        return (this.point.options.value > minCountForTreeMapLabels) ? this.point.name : false;
                    },
                    style: {
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }
                }
            },
                {
                    level: 3,
                    layoutAlgorithm: 'sliceAndDice',
                    dataLabels: {
                        enabled: res.levelCounts[3] < 500,
                        formatter: function() {
                            return (this.point.options.value > minCountForTreeMapLabels) ? this.point.name : false;
                        }
                    },
                    colorVariation: {
                        key: 'brightness',
                        to: -0.5
                    }
                }, {
                    level: 4,
                    layoutAlgorithm: 'sliceAndDice',
                    dataLabels: {
                        enabled: taxonomy.length < 500
                    },
                    colorVariation: {
                        key: 'brightness',
                        to: 0.5
                    }
                }],
            tooltip: {
        headerFormat: '',
            pointFormat: '<b>{point.name} : {point.value}</b> occurrences'
    },
            data: taxonomy
        }],

        boost: {
            useGPUTranslations: true
        }
    };
    var options = (type === 'treemap') ? treeMapOptions : sunBurstOptions;

            if (click && typeof click === 'function') {
        options.series[0].point = {
            events: {
                click: click
            }
        };
    }
   return Highcharts.chart(elm, options);
}

module.exports = occurrenceTaxonomyStats;

