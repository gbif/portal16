'use strict';

var angular = require('angular');
var _ = require('lodash');
var config = require('./config');
var pieChartHelper = require('./pieChartHelper');
var columnChartHelper = require('./columnChartHelper');
var areaChartHelper = require('./areaChartHelper');
var helper = require('./breakdownHelper');

require('./header/occurrenceBreakdownHeader.directive');
require('./settings/occurrenceBreakdownSettings.directive');
require('./highchart/highchart.directive');

angular
    .module('portal')
    .directive('occurrenceBreakdown', occurrenceBreakdownDirective);

/** @ngInject */
function occurrenceBreakdownDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceBreakdown/occurrenceBreakdown.html?v=' + BUILD_VERSION,
        scope: {
            options: '=',
            display: '=',
            api: '=',
            filter: '='
        },
        link: chartLink,
        controller: occurrenceBreakdown,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function chartLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function occurrenceBreakdown($timeout, $state, $scope, OccurrenceBreakdown, Highcharts, $translate, $q) {
        var vm = this;
        var UPDATE_DELAY_TIME = 500;
        vm.state = {
            type: 'BAR',
            offset: 0,
            limit: 10
        };
        vm.logarithmic = true;

        $scope.create = function(element) {
            vm.chartElement = element[0].querySelector('.chartArea');
            vm.dimension = vm.options.dimension;
            vm.secondDimension = vm.options.secondDimension;
            updateChart();
        };

        /* CLEAN UP ON DESTROY */
        // When the DOM element is removed from the page,
        // AngularJS will trigger the $destroy event on
        // the scope. This is a good time to cancel timers and requests
        $scope.$on('$destroy', function() {
            $timeout.cancel(delayedFilterTimer);
            if (vm.content && vm.content.$cancelRequest) {
                vm.content.$cancelRequest();
            }
        });

        /**
         * update the chart to match the dimension, config
         */
        function updateChart() {
            // Validate provided options. If wrong, then show an error message instead
            updateContent();
        }

        function updateContent() {
            if (!vm.options.dimension) {
                vm.chartdata = undefined;
                return;
            }

            var q = _.assign({}, vm.filter,
                    {offset: vm.options.offset, limit: vm.options.limit},
                    config.getDimensionParams(vm.options.dimension, vm.options.secondDimension)
            );
            if (vm.content && vm.content.$cancelRequest) {
                vm.content.$cancelRequest();
            }
            vm.content = OccurrenceBreakdown.query(q);
            $translate('occurrences');
            $q.all({
                    response: vm.content.$promise,
                    occurrences_translation: $translate('metrics.occurrences'),
                    otherOrUknown_translation: $translate('metrics.otherOrUknown'),
                    clickToZoom_translation: $translate('metrics.clickToZoom'),
                    pinchToZoom_translation: $translate('metrics.pinchToZoom')
                })
                .then(function(resolved) {
                    var response = resolved.response;
                    vm.chartdata = response;// 'chart data after transform of the data response';
                    // clean filters
                    vm.chartdata.results.forEach(function(e) {
                        helper.cleanFilter(e.filter);
                    });
                    if (vm.chartdata.categories) {
                        vm.chartdata.categories.forEach(function(e) {
                            helper.cleanFilter(e.filter);
                        });
                    }
                    vm.translations = {
                        occurrences: resolved.occurrences_translation,
                        otherOrUknown: resolved.otherOrUknown_translation,
                        clickToZoom: resolved.clickToZoom_translation,
                        pinchToZoom: resolved.pinchToZoom_translation
                    };
                    formatData(vm.chartdata);
                })
                .catch(function(err) {
                    if (err.status !== -1) {
                        console.error('failed to load data : ' + err);
                    }
                });
        }

        function formatData(chartdata) {
            if (!chartdata || !chartdata.$resolved) {
                return;
            }
            if (vm.myChart) {
                vm.myChart.destroy();
                vm.myChart = undefined;
            }
            if (vm.display.type == 'TABLE') {
                var logMin = Math.log(chartdata.min);
                var logStart = Math.max(0, Math.floor(logMin));
                var logMax = Math.log(chartdata.max);
                chartdata.results.forEach(function(e) {
                    if (e.count == 0) {
                        e._relativeCount = 0;
                    } else {
                        e._relativeCount = 100 * (Math.log(e.count) - logStart) / (logMax - logStart);
                    }
                });
            } else if (vm.display.type == 'COLUMN') {
                var columnConfig = columnChartHelper.getConfig(chartdata, vm.chartElement, occurrenceSearch, vm.translations, vm.logarithmic);
                vm.chartConfig = columnConfig;
            } else if (vm.display.type == 'LINE') {
                var areaConfig = areaChartHelper.getConfig(chartdata, vm.chartElement, occurrenceSearch, vm.translations, vm.logarithmic, Highcharts);
                vm.chartConfig = areaConfig;
            } else if (vm.display.type == 'PIE') {
                var pieConfig = pieChartHelper.getConfig(chartdata, vm.chartElement, occurrenceSearch, vm.translations);
                vm.chartConfig = pieConfig;
            }
        }

        vm.toggleLogarithmic = function() {
            formatData(vm.chartdata);
        };

        function occurrenceSearch(filter) {
            var q = _.assign({}, vm.filter, filter);
            if ($state.current.parent == 'occurrenceSearch') {
                $state.go('.', q);
            } else {
                $state.go('occurrenceSearchTable', q);
            }
        }
        vm.occurrenceSearch = occurrenceSearch;

        vm.level = function(val) {
            if (val < 2) {
                return val;
            }
            // var percentage = 100 * (val - vm.chartdata.min) / (vm.chartdata.max - vm.chartdata.min);

            var logMin = vm.chartdata.min == 0 ? 0 : Math.log(vm.chartdata.min);
            var logStart = Math.floor(logMin);
            var logMax = Math.log(vm.chartdata.max);
            var percentage = 100 * (Math.log(val) - logStart) / (logMax - logStart);

            return Math.max(Math.min(Math.ceil(percentage), 100), 1); // cap values due to rounding errors
        };

        vm.getFacetFilter = function(filter) {
            return _.assign({}, vm.filter, filter);
        };

        vm.getTableFilter = function(filterA, filterB) {
            return _.assign({}, vm.filter, filterA, filterB);
        };

        vm.resultType = function() {
            if (_.get(vm.chartdata, 'total', 0) === 0) {
                return 'EMPTY';
            }
            var singleBucket = _.get(vm.chartdata, 'results.length', 0) === 1 &&
            _.get(vm.chartdata, 'categories.length', 1) === 1 &&
            _.get(vm.chartdata, 'diff', 0) === 0 &&
            _.get(vm.chartdata, 'secondDiff', 0) === 0;

            if (singleBucket) {
                return 'SINGLE_BUCKET';
            } else {
                return 'MULTIPLE_BUCKETS';
            }
        };

        /* WATCH FILTERS FOR CHANGES */
        var delayedFilterTimer;

        $scope.$watchCollection(function() {
            return vm.filter;
        }, function() {
            $timeout.cancel(delayedFilterTimer);
            vm.pendingUpdate = true;
            delayedFilterTimer = $timeout(function() {
                updateChart();
            }, UPDATE_DELAY_TIME);
        });

        $scope.$watchCollection(function() {
            return vm.options;
        }, function(updated, past) {
            var supportedChartTypes = vm.api.getSupportedTypes();
            if (!supportedChartTypes[vm.display.type]) {
                // get first supported type
                vm.display.type = _.findKey(supportedChartTypes) || 'TABLE';
            }
            updateContent();
        });

        $scope.$watchCollection(function() {
            return vm.display;
        }, function() {
            formatData(vm.chartdata);
        });

        /* GENERATE API TO EXPOSE TO DIRECTIVE USER */
        // consider splitting in to seperate file
        if (vm.api) {
            vm.api.download = function() {
                console.log('this will download the chart');
            };

            vm.api.data = function() {
                return vm.chartdata;
            };

            vm.api.cancel = function() {
                if (vm.content && vm.content.$cancelRequest) {
                    vm.content.$cancelRequest();
                    return true;
                }
                return false;
            };

            vm.api.isLoading = function() {
                return vm.content && !vm.content.$resolved;
            };

            vm.api.getDimension = function() {
                return vm.dimension;
            };

            vm.api.getSupportedTypes = function() {
                var dimension = vm.options.dimension;
                var secondDimension = vm.options.secondDimension;
                var supportedTypes = {
                    'PIE': dimension && !secondDimension && dimension !== 'year',
                    'TABLE': dimension && dimension !== 'year',
                    'COLUMN': dimension && dimension !== 'year',
                    'LINE': dimension === 'year'
                };
                if (dimension === 'year' && secondDimension) {
                    supportedTypes.LINE = false;
                    supportedTypes.TABLE = true;
                }
                return supportedTypes;
            };

            vm.api.options = config;
        }
    }
}

module.exports = occurrenceBreakdownDirective;
