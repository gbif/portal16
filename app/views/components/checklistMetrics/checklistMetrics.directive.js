'use strict';

var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .directive('checklistMetrics', checklistMetrics);

/** @ngInject */
function checklistMetrics() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/components/checklistMetrics/checklistMetrics.html',
        scope: {},
        controller: checklistMetrics,
        link: chartLink,
        controllerAs: 'checklistMetrics',
        bindToController: {
            metrics: '=',
            dimension: '=',
            api: '=',
            options: '='
        }
    };
    return directive;

    function chartLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function checklistMetrics(Highcharts, $scope, $translate, $filter, enums, $q) {
        var vm = this;
        vm.logScale = true;
        var translations = {};
        var u;
        if (vm.dimension === 'countByIssue') {
            u = 'stdTerms.issues';
        } else if (vm.dimension === 'countExtRecordsByExtension') {
            u = 'species.extensions';
        } else if (vm.dimension === 'countNamesByLanguage') {
            u = 'metrics.vernacularNames';
        } else {
            u = 'species.taxa';
        }
        translations.unit = $translate(u);


        $scope.create = function(element) {
            vm.chartElement = element[0].querySelector('.chartArea');
        };

        vm.loading = true;

        angular.element(document).ready(function() {
            vm.metrics.$promise.then(function(metrics) {
                vm.loading = false;
                if (vm.metrics[vm.dimension]) {
                    var data = {categories: [], series: [{data: [], total: 0}]};
                    var mappedData = _.map(vm.metrics[vm.dimension], function(value, key) {
                        return {key: key, count: value};
                    });
                    var sorted = (vm.dimension !== 'countByRank') ? _.orderBy(mappedData, ['count'], ['desc']) :
                        _.sortBy(mappedData, [function(r) {
                            return enums.rank.indexOf(r.key);
                        }]);
                    var translatedCategories = {};
                    for (var i = 0; i < sorted.length; i++) {
                        translatedCategories[sorted[i].key] = getTranslation(vm.dimension, sorted[i].key);
                    }

                    translations.categories = $q.all(translatedCategories);
                    translations.title = $translate('datasetMetrics.' + vm.dimension);
                    translations.other = $translate('stdTerms.other');

                    $q.all(translations).then(function(res) {
                        for (var i = 0; i < sorted.length; i++) {
                            if (sorted[i].count > 0) {
                                data.categories.push(res.categories[sorted[i].key]);
                                data.series[0].data.push(sorted[i].count);
                                data.series[0].total += sorted[i].count;
                            }
                        }
                        data.title = res.title;
                        vm.unit = res.unit;
                        vm.other = res.other;
                        vm.data = data;
                        setChartHeight();
                        if (vm.myChart) {
                            vm.myChart.destroy();
                        }
                        vm.chartElement.style.height = vm.chartHeight + 'px';
                        if (vm.options.type == 'BAR') {
                            vm.myChart = Highcharts.chart(asBarChart(vm.data, vm.logScale));
                        } else if (vm.options.type == 'PIE') {
                            vm.myChart = Highcharts.chart(asPieChart(vm.data));
                        }
                    }, function(err) {
                        console.log(err);
                    });
                } else {
                    vm.error = true;
                }
            });
        });

        function setChartHeight() {
            var categories = _.get(vm.data, 'categories.length');
            if (vm.options.type == 'BAR') {
                categories = categories || 10;
                vm.chartHeight = categories * 20 + 100;
            } else {
                if (categories <= 3) {
                    vm.chartHeight = 300;
                } else {
                    vm.chartHeight = 400;
                }
            }
        }


        function asBarChart(data, isLogaritmic) {
            return {
                chart: {
                    animation: false,
                    type: 'bar',
                    renderTo: vm.chartElement,
                    className: (vm.dimension === 'countByIssue') ? 'chart-field-issue' : ''
                },
                plotOptions: {
                    series: {
                        animation: false,

                        pointWidth: 20,
                        pointPadding: 0,
                        groupPadding: 0
                    }
                },
                legend: {
                    enabled: false
                },
                bar: {
                    minPointLength: 10
                },
                title: {
                    text: ''// data.title
                },
                xAxis: {
                    categories: data.categories,
                    visible: true
                },
                yAxis: {
                    title: {
                        text: vm.unit
                    },
                    type: isLogaritmic ? 'logarithmic' : 'linear',
                    minorTickInterval: isLogaritmic ? 1 : undefined,
                    visible: true
                },
                series: [{
                    name: vm.unit,
                    data: data.series[0].data
                }],
                credits: {
                    enabled: false
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            enabled: false
                        }
                    }
                }
            };
        }

        function asPieChart(data) {
            var serie = data.series[0].data.map(function(e, i) {
                return {
                    name: data.categories[i],
                    y: e
                };
            }).sort(function(a, b) {
                return b.y - a.y;
            });

            var lowCount = data.series[0].total / 50;
            var lowIndex = _.findIndex(serie, function(a) {
                return a.y < lowCount;
            });
            lowIndex = Math.min(20, lowIndex);
            var majorSerie = serie;
            if (lowIndex != -1) {
                lowIndex = Math.max(lowIndex, 5);
                majorSerie = serie.slice(0, lowIndex);
                var minor = serie.slice(lowIndex);
                if (minor.length > 0) {
                    majorSerie.push({y: _.sumBy(minor, 'y'), name: vm.other});
                }
            }

            return {
                chart: {
                    animation: false,
                    type: 'pie',
                    renderTo: vm.chartElement
                },
                plotOptions: {
                    series: {
                        animation: false
                    }
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: ''// data.title
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                xAxis: {
                    visible: false
                },
                yAxis: {
                    visible: false
                },
                series: [{
                    name: vm.unit,
                    data: majorSerie
                }],
                exporting: {
                    buttons: {
                        contextButton: {
                            enabled: false
                        }
                    }
                }
            };
        }

        function getTranslation(dimension, key) {
            switch (dimension) {
                case 'countByKingdom':
                    return $q.resolve($filter('capitalizeFirstLetter')(key.replace('_', ' ').toLowerCase()));
                case 'countByRank':
                    return $translate('taxonRank.' + key);
                case 'countByOrigin':
                    return $translate('originEnum.' + key);
                case 'countByIssue':
                    return $translate('issueEnum.' + key);
                case 'countExtRecordsByExtension':
                    return $translate('extensionEnum.' + key);
                case 'countNamesByLanguage':
                    return $q.resolve($filter('capitalizeFirstLetter')(key.replace('_', ' ').toLowerCase()));
            }
        }

        vm.toggleBarChart = function() {
            vm.myChart.destroy();
            setChartHeight();
            vm.chartElement.style.height = vm.chartHeight + 'px';
            vm.myChart = Highcharts.chart(asBarChart(vm.data, vm.logScale));
        };

        vm.togglePieChart = function() {
            vm.myChart.destroy();
            setChartHeight();
            vm.chartElement.style.height = vm.chartHeight + 'px';
            vm.myChart = Highcharts.chart(asPieChart(vm.data));
        };
        // create API
        vm.api.print = function() {
            vm.myChart.print();
        };
        vm.api.png = function() {
            vm.myChart.exportChart();
        };
        vm.api.svg = function() {
            vm.myChart.exportChart({
                type: 'image/svg+xml'
            });
        };
        vm.api.getTitle = function() {
            return _.get(vm.data, 'title');
        };
        vm.api.asPieChart = function() {
            vm.options.type = 'PIE';
            return vm.togglePieChart();
        };
        vm.api.asBarChart = function() {
            vm.options.type = 'BAR';
            return vm.toggleBarChart();
        };

        if (Object.freeze) {
            Object.freeze(vm.api);
        }
    }
}

module.exports = checklistMetrics;

