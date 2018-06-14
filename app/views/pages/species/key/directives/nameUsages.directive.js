'use strict';

var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .directive('nameUsages', nameUsagesDirective);

/** @ngInject */
function nameUsagesDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/nameUsages.html',
        scope: {},
        controller: nameUsagesCtrl,
        link: chartLink,
        controllerAs: 'nameUsages',
        bindToController: {
            species: '=',
            synonyms: '='
        }
    };
    return directive;
    function chartLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }
    /** @ngInject */
    function nameUsagesCtrl($scope, OccurrenceSearch, Highcharts, $state, $translate) {
        var vm = this;
        vm.key = vm.species.key;
        vm.categories = [];
        vm.data = [];

        if (vm.synonyms && vm.synonyms.$promise) {
            vm.synonyms.$promise.then(function() {
                OccurrenceSearch.query({taxon_key: vm.key, facet: 'taxon_key', limit: 0}).$promise
                    .then(function(facets) {
                        var usages = _.find(facets.facets, function(f) {
                            return f.field = 'TAXON_KEY';
                        }).counts;

                        var totalCount = _.find(usages, function(u) {
                            return u.name = vm.key;
                        });


                        vm.synonymNameUsages = [];
                        angular.forEach(vm.synonyms.results, function(s) {
                            var found = _.find(usages, function(u) {
                                return u.name === s.key.toString() && vm.species.rank === s.rank;
                            });
                            if (found) {
                                found.scientificName = s.scientificName;
                                vm.synonymNameUsages.push(found);
                            }
                        });

                        var totalMinusAccepted = _.reduce(vm.synonymNameUsages, function(sum, n) {
                            return sum + parseInt(n.count);
                        }, 0);

                        vm.data.push(totalCount.count - totalMinusAccepted);
                        vm.categories.push({name: vm.species.scientificName, key: vm.species.key});

                        for (var i = 0; i < vm.synonymNameUsages.length; i++) {
                            vm.data.push(parseInt(vm.synonymNameUsages[i].count));
                            vm.categories.push({name: vm.synonymNameUsages[i].scientificName, key: vm.synonymNameUsages[i].name});
                        }
                        angular.element(document).ready(function() {
                            Highcharts.chart(asPieChart({series: [{data: vm.data}], categories: vm.categories}));
                        });
                    });
            });
        }

        $scope.create = function(element) {
            vm.chartElement = element[0].querySelector('.nameUsageChartContainer');
        };

        function asPieChart(data) {
            var serie = data.series[0].data.map(function(e, i) {
                return {
                    name: data.categories[i].name,
                    y: e,
                    key: data.categories[i].key
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
                    majorSerie.push({y: _.sumBy(minor, 'y'), name: 'other'});
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
                    name: $translate.instant('stdTerms.occurrences'),
                    data: majorSerie,
                    point: {
                        events: {
                            click: function() {
                                $state.go('occurrenceSearchTable', {taxon_key: this.options.key});
                            }
                        }
                    }
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
    }
}

module.exports = nameUsagesDirective;

