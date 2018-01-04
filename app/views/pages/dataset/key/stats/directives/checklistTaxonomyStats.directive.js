'use strict';

var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .directive('checklistTaxonomyStats', checklistTaxonomyStats);

/** @ngInject */
function checklistTaxonomyStats() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/dataset/key/stats/directives/checklistTaxonomyStats.html',
        scope: {},
        controller: checklistTaxonomyStats,
        controllerAs: 'checklistTaxonomyStats',
        bindToController: {
            dataset: '='
        }
    };
    return directive;

    /** @ngInject */
    function checklistTaxonomyStats(Highcharts, DatasetChecklistTaxonomy, $filter) {
        var vm = this;
        vm.loading = true;
        angular.element(document).ready(function () {

            DatasetChecklistTaxonomy.query({key: vm.dataset.key}).$promise
                .then(function(taxonomy){
                    var colors = Highcharts.getOptions().colors,
                        categories = [],
                        data = [],
                        totalCount = 0,
                        rankOrder = [],
                        rootRankIndex = 0;

                        if(taxonomy.KINGDOM && taxonomy.KINGDOM.length > 0){
                            rankOrder.push("KINGDOM")
                        };
                    if(taxonomy.PHYLUM && taxonomy.PHYLUM.length > 0){
                        rankOrder.push("PHYLUM")
                    }
                    if(taxonomy.CLASS && taxonomy.CLASS.length > 0){
                        rankOrder.push("CLASS")
                    }
                    if(taxonomy.ORDER && taxonomy.ORDER.length > 0){
                        rankOrder.push("ORDER")
                    }
                    if(taxonomy.FAMILY && taxonomy.FAMILY.length > 0){
                        rankOrder.push("FAMILY")
                    }
                    if(taxonomy.GENUS && taxonomy.GENUS.length > 0){
                        rankOrder.push("GENUS")
                    };

                    var rootRank = rankOrder[0];


                        while(taxonomy[rankOrder[rootRankIndex]].length < 2 ){
                            rootRankIndex ++;
                            rootRank = rankOrder[rootRankIndex];
                        }
                        if(rootRankIndex > 0){
                            if(taxonomy[rankOrder[rootRankIndex]].length > 20 || (!taxonomy[rankOrder[rootRankIndex]][0].children && taxonomy[rankOrder[rootRankIndex -1]][0].children)){
                                rootRankIndex --;
                                rootRank = rankOrder[rootRankIndex];
                            }
                        }


                    for(var i=0; i< taxonomy[rootRank].length; i++){

                        totalCount += taxonomy[rootRank][i]._count;
                        if(taxonomy[rootRank][i].canonicalName) {
                            categories.push(taxonomy[rootRank][i].canonicalName);
                        } else {
                            categories.push(taxonomy[rootRank][i].scientificName);
                        }

                        var childData = [];
                        var childCategories = [];
                        if(taxonomy[rootRank][i].children){
                            for(var j=0; j < taxonomy[rootRank][i].children.length; j++ ){
                                if(taxonomy[rootRank][i].children[j].canonicalName){
                                    childCategories.push(taxonomy[rootRank][i].children[j].canonicalName)
                                } else {
                                    childCategories.push(taxonomy[rootRank][i].children[j].scientificName)
                                }

                                childData.push(taxonomy[rootRank][i].children[j]._count)

                            }
                        }

                        data.push({
                            y: taxonomy[rootRank][i]._count,
                            color: colors[i],
                            drilldown: {
                                color:   colors[i],
                                categories: childCategories,
                                data: childData

                            }
                        })

                    };


                    var  kingdomData = [],
                        childData = [],
                        i,
                        j,
                        dataLen = data.length,
                        drillDataLen,
                        brightness;


// Build the data arrays
                    for (i = 0; i < dataLen; i += 1) {

                        // add browser data
                        kingdomData.push({
                            name: categories[i],
                            y: data[i].y,
                            color: data[i].color
                        });

                        // add version data
                        drillDataLen = data[i].drilldown.data.length;
                        for (j = 0; j < drillDataLen; j += 1) {
                            brightness = 0.2 - (j / drillDataLen) / 5;
                            childData.push({
                                name: data[i].drilldown.categories[j],
                                y: data[i].drilldown.data[j],
                                color: Highcharts.Color(data[i].color).brighten(brightness).get()
                            });
                        }
                    }


                    Highcharts.chart('taxonomyStats', {
                        chart: {
                            type: 'pie'
                        },
                        title: {
                            text: 'Number of species by higher Taxon'
                        },

                        yAxis: {
                            title: {
                                text: 'Total percent market share'
                            }
                        },
                        plotOptions: {
                            pie: {
                                shadow: false,
                                center: ['50%', '50%']
                            }
                        },
                        tooltip: {

                        },
                        series: [{
                            name: 'Species',
                            data: kingdomData,
                            size: '60%',
                            dataLabels: {
                                formatter: function () {
                                    return this.y > (totalCount / 10) ? this.point.name : null;
                                },
                                color: '#ffffff',
                                distance: -30
                            }
                        }, {
                            name: 'Species',
                            data: childData,
                            size: '80%',
                            innerSize: '60%',
                            dataLabels: {
                                formatter: function () {
                                    // display only if larger than 1
                                    return this.y > 1 ? '<b>' + this.point.name + ':</b> ' +
                                        $filter('localNumber')(this.y , gb.locale)  : null;
                                }
                            },
                            id: 'versions'
                        }],
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


                vm.loading = false;





                });

        });


    }
}

module.exports = checklistTaxonomyStats;

