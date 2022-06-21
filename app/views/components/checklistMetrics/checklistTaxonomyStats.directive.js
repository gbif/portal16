'use strict';

var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .directive('checklistTaxonomyStats', checklistTaxonomyStatsDirective);

/** @ngInject */
function checklistTaxonomyStatsDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/components/checklistMetrics/checklistTaxonomyStats.html?v=' + BUILD_VERSION,
        scope: {},
        controller: checklistTaxonomyStats,
        link: chartLink,
        controllerAs: 'checklistTaxonomyStats',
        bindToController: {
            dataset: '='
        }
    };
    return directive;
    /** @ngInject */
    function chartLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function checklistTaxonomyStats(Highcharts, DatasetChecklistTaxonomy, $filter, $state, $scope, LOCALE_2_LETTER) {
        var vm = this;
        vm.loading = true;
        $scope.create = function(element) {
            vm.chartElement = element[0].querySelector('.chartArea');
        };
        vm.api = {};
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

        var MAX_ROOT_LENGTH = 10;
        var MAX_CHILD_LENGTH = 50;

        angular.element(document).ready(function() {
            DatasetChecklistTaxonomy.query({key: vm.dataset.key}).$promise
                .then(function(taxonomy) {
                    vm.loading = false;
                    vm.preparing = true;
                    var colors = Highcharts.getOptions().colors,
                        categories = [],
                        data = [],
                        rankOrder = [],
                        rootRankIndex = 0;

                    vm.hasRankedTaxa = false;
                    if (taxonomy.KINGDOM && taxonomy.KINGDOM.length > 0) {
                        vm.hasRankedTaxa = true;
                        rankOrder.push('KINGDOM');
                    }
                    if (taxonomy.PHYLUM && taxonomy.PHYLUM.length > 0) {
                        vm.hasRankedTaxa = true;

                        rankOrder.push('PHYLUM');
                    } else if (taxonomy.PHYLUM.length === 0) {
                        delete taxonomy.PHYLUM;
                    }
                    if (taxonomy.CLASS && taxonomy.CLASS.length > 0) {
                        vm.hasRankedTaxa = true;

                        rankOrder.push('CLASS');
                    } else if (taxonomy.CLASS.length === 0) {
                        delete taxonomy.CLASS;
                    }
                    if (taxonomy.ORDER && taxonomy.ORDER.length > 0) {
                        vm.hasRankedTaxa = true;

                        rankOrder.push('ORDER');
                    } else if (taxonomy.ORDER.length === 0) {
                        delete taxonomy.ORDER;
                    }
                    if (taxonomy.FAMILY && taxonomy.FAMILY.length > 0) {
                        vm.hasRankedTaxa = true;

                        rankOrder.push('FAMILY');
                    } else if (taxonomy.FAMILY.length === 0) {
                        delete taxonomy.FAMILY;
                    }
                    if (taxonomy.GENUS && taxonomy.GENUS.length > 0) {
                        vm.hasRankedTaxa = true;

                        rankOrder.push('GENUS');
                    } else if (taxonomy.GENUS.length === 0) {
                        delete taxonomy.GENUS;
                    }


                    if (!vm.hasRankedTaxa) {
                        vm.preparing = false;
                    } else {
                        var rootRank = rankOrder[0];


                        while (taxonomy[rankOrder[rootRankIndex]] && taxonomy[rankOrder[rootRankIndex]].length < 2 && rootRankIndex < rankOrder.length - 1) {
                            rootRankIndex++;
                            rootRank = rankOrder[rootRankIndex];
                        }
                        if (rootRankIndex > 0) {
                            if (taxonomy[rankOrder[rootRankIndex]].length > 20 || (!taxonomy[rankOrder[rootRankIndex]][0].children && taxonomy[rankOrder[rootRankIndex - 1]][0].children)) {
                                rootRankIndex--;
                                rootRank = rankOrder[rootRankIndex];
                            }
                        }

                        if (taxonomy[rootRank].length >= MAX_ROOT_LENGTH && taxonomy.KINGDOM.length === 0) {
                            taxonomy.KINGDOM.push({
                                canonicalName: 'Unknown Kingdom',
                                rank: 'KINGDOM',
                                children: taxonomy[rootRank],
                                _count: taxonomy.count
                            });
                            rootRank = 'KINGDOM';
                        }

                        for (var i = 0; i < taxonomy[rootRank].length; i++) {
                            var MAX_CHILD_LENGTH_LOCAL = Math.round(MAX_CHILD_LENGTH * (taxonomy.count / taxonomy[rootRank][i]._count ));

                            if (taxonomy[rootRank][i].canonicalName) {
                                categories.push(taxonomy[rootRank][i].canonicalName);
                            } else {
                                categories.push(taxonomy[rootRank][i].scientificName);
                            }

                            var childData = [];
                            var childCategories = [];

                            var totalChildCount = 0;
                            var otherCount = 0;

                            if (taxonomy[rootRank][i].children) {
                                for (var j = 0; j < taxonomy[rootRank][i].children.length; j++) {
                                    totalChildCount += taxonomy[rootRank][i].children[j]._count;

                                    if (j < MAX_CHILD_LENGTH_LOCAL) {
                                        if (taxonomy[rootRank][i].children[j].canonicalName) {
                                            childCategories.push(taxonomy[rootRank][i].children[j].canonicalName);
                                        } else {
                                            childCategories.push(taxonomy[rootRank][i].children[j].scientificName);
                                        }

                                        childData.push({
                                            y: taxonomy[rootRank][i].children[j]._count,
                                            _key: taxonomy[rootRank][i].children[j].key
                                        });
                                    } else {
                                        otherCount += taxonomy[rootRank][i].children[j]._count;
                                    }
                                }
                            }
                            otherCount += (taxonomy[rootRank][i]._count - totalChildCount);

                            if (totalChildCount < taxonomy[rootRank][i]._count || (taxonomy[rootRank][i].children && taxonomy[rootRank][i].children.length >= MAX_CHILD_LENGTH_LOCAL)) {
                                if (taxonomy[rootRank][i].canonicalName) {
                                    var rootRankName = (taxonomy[rootRank][i].canonicalName === 'Unknown Kingdom') ? 'Other' : 'Other ' + taxonomy[rootRank][i].canonicalName;
                                    childCategories.push(rootRankName);
                                } else {
                                    childCategories.push('Other ' + taxonomy[rootRank][i].scientificName);
                                }
                                childData.push({y: otherCount});
                            }
                            data.push({
                                y: taxonomy[rootRank][i]._count,
                                _key: taxonomy[rootRank][i].key,
                                color: colors[i],
                                drilldown: {
                                    color: colors[i],
                                    categories: childCategories,
                                    data: childData

                                }
                            });
                        }


                        var kingdomData = [],
                            dataLen = data.length,
                            drillDataLen,
                            brightness;

                        childData = [];


// Build the data arrays
                        for (i = 0; i < dataLen; i += 1) {
                            // add root taxon data
                            kingdomData.push({
                                name: categories[i],
                                y: data[i].y,
                                _key: data[i]._key,
                                color: data[i].color
                            });

                            // add data for child taxa
                            drillDataLen = data[i].drilldown.data.length;
                            for (j = 0; j < drillDataLen; j += 1) {
                                brightness = 0.2 - (j / drillDataLen) / 5;
                                childData.push({
                                    name: data[i].drilldown.categories[j],
                                    y: data[i].drilldown.data[j].y,
                                    _key: data[i].drilldown.data[j]._key,
                                    color: Highcharts.Color(data[i].color).brighten(brightness).get()
                                });
                            }
                        }


                        vm.myChart = Highcharts.chart(vm.chartElement, {
                            chart: {
                                type: 'pie'
                            },
                            credits: false,
                            title: {
                                text: ''
                            },

                            yAxis: {
                                title: {
                                    text: 'Species count'
                                }
                            },
                            plotOptions: {
                                pie: {
                                    shadow: false,
                                    center: ['50%', '50%']
                                }
                            },
                            tooltip: {},
                            series: [{
                                name: 'Species',
                                data: kingdomData,
                                point: {
                                    events: {
                                        click: function() {
                                            if (this._key) {
                                                $state.go('speciesKey', {speciesKey: this._key});
                                            }
                                        }
                                    }
                                },
                                size: '60%',
                                dataLabels: {
                                    formatter: function() {
                                        return this.y > (taxonomy.count / 10) ? this.point.name : null;
                                    },
                                    distance: -30
                                }
                            }, {
                                name: 'Species',
                                data: childData,
                                point: {
                                    events: {
                                        click: function() {
                                            if (this._key) {
                                                $state.go('speciesKey', {speciesKey: this._key});
                                            }
                                        }
                                    }
                                },
                                size: '80%',
                                innerSize: '60%',
                                dataLabels: {
                                    formatter: function() {
                                        // display only if larger than 1
                                        return this.y > 1 ? '<b>' + this.point.name + ':</b> ' +
                                            $filter('localNumber')(this.y, LOCALE_2_LETTER) : null;
                                    }
                                },
                                id: 'versions'
                            }],

                            exporting: {
                                buttons: {
                                    contextButton: {
                                        enabled: false
                                    }
                                }
                            },
                            responsive: {
                                rules: [{
                                    condition: {
                                        maxWidth: 400
                                    },
                                    chartOptions: {
                                        series: [{
                                            id: 'versions',
                                            dataLabels: {
                                                enabled: false
                                            }
                                        }]
                                    }
                                }]
                            }
                        });


                        vm.preparing = false;
                    }
                });
        });
    }
}

module.exports = checklistTaxonomyStatsDirective;
