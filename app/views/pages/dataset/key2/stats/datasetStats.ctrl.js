'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetStatsCtrl', datasetStatsCtrl);

/** @ngInject */
function datasetStatsCtrl($timeout, $stateParams, DatasetExtended, OccurrenceTableSearch, OccurrenceSearch) {
    var vm = this;
    vm.key = $stateParams.key; //TODO what would be a better way to do this? an bootstraped constant possibly?
    vm.occurrences = OccurrenceSearch.query({dataset_key: vm.key, limit:0});
    vm.testthis = 'hej';

    function generateColors() {
        var colors = [];
        var arrayColors = [
            "255, 231, 151",
            "255, 167, 40",
            "242, 218, 254",
            "146, 101, 194",
            "220, 220, 170",
            "206, 120, 255",
            "71, 160, 220",
            "218, 255, 0",
            "91, 200, 84",
            "255, 194, 193",
            "255, 66, 68",
            "217, 129, 80"
        ];

        for (var i = 0, countColors = arrayColors.length; i < countColors; i++) {
            var rgb = arrayColors[i];
            colors.push({
                'fill': "false",
                'backgroundColor': "rgba(0,0,0,0)",
                'borderColor': "rgba(" + rgb + ",1)",
                'pointBackgroundColor': "rgba(" + rgb + ",1)",
                'pointHoverBackgroundColor': "rgba(" + rgb + ",0.8)",
                'pointBorderColor': "#fff",
                'pointHoverBorderColor': "rgba(" + rgb + ",1)",
            });
        }
        return colors;
    }


    vm.occurrenceKingdoms = {};
    function getOccurrenceKingdoms() {
        vm.occurrenceKingdoms.kingdoms = OccurrenceTableSearch.query({dataset_key: vm.key, limit:0, facet: 'kingdomKey'});

        vm.occurrenceKingdoms.labels = [
            "Red",
            "Blue",
            "Yellow"
        ];
        vm.occurrenceKingdoms.data = [300, 50, 100];
        vm.colors = [
            {
                backgroundColor: "rgba(255,104,0, 1)",
                pointBackgroundColor: "rgba(0,0,255, 1)",
                pointHoverBackgroundColor: "rgba(0,255,0, 1)",
                hoverBackgroundColor: "rgba(0,255,0, 1)",
                borderColor: "rgba(0,255,0, 1)",
                pointBorderColor: 'rgba(0,255,0, 1)',
                pointHoverBorderColor: "rgba(0,255,0, 1)"
            },"rgba(250,109,33,0.5)","#9a9a9a","rgb(233,177,69)"
        ];
        vm.datasetOverride = {
            backgroundColor: [
                "rgba(0,0,255, 0.5)",
                "rgba(0,255,0, 0.5)",
                "rgba(255,0,0, 0.5)"
            ],
            hoverBackgroundColor: [
                "rgba(0,0,255, 1.0)",
                "rgba(0,255,0, 1.0)",
                "rgba(255,0,0, 1.0)"
            ] ,

        };

        // vm.colors = [{
        //     backgroundColor: 'rgba(78, 180, 189, 1)',
        //     pointBackgroundColor: 'rgba(78, 180, 189, 1)',
        //     pointHoverBackgroundColor: 'rgba(151,187,205,1)',
        //     borderColor: 'rgba(0,0,0,0',
        //     pointBorderColor: '#fff',
        //     pointHoverBorderColor: 'rgba(151,187,205,1)'
        // }, {
        //     backgroundColor: 'rgba(229, 229, 229, 1)',
        //     pointBackgroundColor: 'rgba(229, 229, 229, 1)',
        //     pointHoverBackgroundColor: 'rgba(151,187,205,1)',
        //     borderColor: 'rgba(0,0,0,0',
        //     pointBorderColor: '#fff',
        //     pointHoverBorderColor: 'rgba(151,187,205,1)'
        // },
        // {
        //     backgroundColor: 'rgba(0, 0, 229, 1)',
        //     pointBackgroundColor: 'rgba(0, 0, 229, 1)',
        //     pointHoverBackgroundColor: 'rgba(0,0,205,1)',
        //     borderColor: 'rgba(0,0,0,0',
        //     pointBorderColor: '#fff',
        //     pointHoverBorderColor: 'rgba(0,0,205,1)'
        // }];
        // vm.colors = ['#345fa2']; //'#14243e'
        vm.options = {
            title: {
                display: true,
                text: 'Custom Chart Title'
            },
            legend: {
                display: true,
                labels: {
                    fontColor: 'rgb(255, 99, 132)'
                },
                position: top,
                fullWidth: true
            },
            responsive: true,
            maintainAspectRatio: false,
        };
        vm.onClick = function () { //points, evt
        };
    }
    getOccurrenceKingdoms();


    var ctx = document.getElementById("tester");
    var data = {
        labels: [
            "Red",
            "Blue",
            "Yellow",
            "gren",
            "sdf",
            "230498",
            "sdlkj",
            "sdlkj1",
            "sdlkj2",
            "sdlkj3",
            "sdlkj4",
        ],
        datasets: [
            {
                data: [300, 50, 100, 300, 50, 100, 300, 50, 100, 300, 50, 100],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ]
            }]
    };

    var myChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            title: {
                display: true,
                text: 'Custom Chart Title'
            },
            legend: {
                display: true,
                labels: {
                    fontColor: 'rgb(255, 99, 132)'
                }
            }
        }
    });

    $timeout(function(){
        myChart.data.datasets[0].data[2] = 50;
        myChart.update();
    }, 1000);
    vm.legendContent = myChart.generateLegend();

    ctx.onclick = function (evt) {
        var activePoints = myChart.getElementsAtEvent(evt);
        var chartData = activePoints[0]['_chart'].config.data;
        var idx = activePoints[0]['_index'];

        var label = chartData.labels[idx];
        var value = chartData.datasets[0].data[idx];

        var url = "http://example.com/?label=" + label + "&value=" + value;
        console.log(url);
        alert(url);
    };
}

module.exports = datasetStatsCtrl;