'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('occurrenceCard', occurrenceCardDirective);

/** @ngInject */
function occurrenceCardDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/components/occurrenceCard/occurrenceCard.html',
        scope: {
            query: '='
        },
        controller: occurrenceCardCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function occurrenceCardCtrl($timeout, $scope, OccurrenceSearch) {
        var vm = this;

        //$scope.$watch(function () {
        //    return vm.query;
        //}, function () {
        //
        //});

        function getOccurrences(query){
            vm.occurrences = OccurrenceSearch.query(query);
            vm.facets = OccurrenceSearch.query(_.merge(query, {facet:'year', facetLimit:'1000'}));
        }
        getOccurrences(vm.query);


        vm.labels = ["January", "February", "March", "April", "May", "June", "July"];
        vm.series = ['Series A', 'Series B'];
        vm.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
        vm.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        vm.options = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    }
                ]
            }
        };
        vm.onClick = function () { //points, evt
            //console.log(points, evt);
        };

        // Simulate async data update
        $timeout(function () {
            vm.data = [
                [28, 48, 40, 19, 86, 27, 90],
                [65, 59, 80, 81, 56, 55, 40]
            ];
        }, 3000);
    }
}

module.exports = occurrenceCardDirective;

