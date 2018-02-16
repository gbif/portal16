'use strict';

let angular = require('angular'),
    utils = require('../../shared/layout/html/utils/utils'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('occurrenceCard', occurrenceCardDirective);

/** @ngInject */
function occurrenceCardDirective() {
    let directive = {
        restrict: 'E',
        templateUrl: '/templates/components/occurrenceCard/occurrenceCard.html',
        scope: {
            query: '=',
        },
        controller: occurrenceCardCtrl,
        controllerAs: 'vm',
        bindToController: true,
    };

    return directive;

    /** @ngInject */
    function occurrenceCardCtrl($q, $timeout, $scope, OccurrenceSearch) {
        let vm = this;
        // $scope.$watch(function () {
        //    return vm.query;
        // }, function () {
        //
        // });
        function getOccurrences(query) {
            vm.occurrences = OccurrenceSearch.query(query);
            let occImg = OccurrenceSearch.query(_.merge({}, query, {media_type: 'StillImage'}));
            $q.all([vm.occurrences.$promise, occImg.$promise])
                .then(function(values) {
                    let results = _.slice(_.uniqBy(_.concat(values[1].results, values[0].results), 'key'), 0, 10);
                    utils.attachImages(results);
                    vm.occurrences.results = results;
                });
            let facets = OccurrenceSearch.query(_.merge({}, query, {facet: 'year', facetLimit: '1000', limit: 0}));
            facets.$promise
                .then(prepareChart);
        }

        getOccurrences(vm.query);

        let startYear, groupSize;
        function prepareChart(response) {
            let results = _.orderBy(response.facets[0].counts, 'name');
            let distinct = results.length;
            if (distinct < 2) {
                // hide chart area as their isn't enough data ? or show 50 years before and after to emphisze that there really isn't more data
                return;
            }
            let firstYear = _.toSafeInteger(results[0].name);
            let lastYear = _.toSafeInteger(results[distinct - 1].name);
            let fullYearRange = _.range(firstYear, lastYear+1, 1);
            // group
            let groupCount = 20;
            groupSize = _.toSafeInteger(Math.ceil(fullYearRange.length / groupCount));
            startYear = lastYear - (groupCount*groupSize);
            let groups = _.groupBy(results, function(e) {
                return startYear + Math.ceil((_.toSafeInteger(e.name) - startYear) / groupSize)*groupSize;
            });
            let labels = [],
                values = [];
            _.forEach(groups, function(value, key) {
                labels.push((_.toSafeInteger(key) - groupSize) + '-' + key);
                values.push(_.sumBy(value, 'count'));
            });

            vm.labels = labels;
            vm.data = [values];


            // vm.labels = fullYearRange;
            // vm.data = [yearCounts];
        }

        vm.labels = [];
        vm.series = ['Reported occurrences'];
        vm.data = [[]];
        // vm.colors = [{ // default
        //     "fillColor": "rgb(255,0,255)",
        //     "strokeColor": "rgb(0,0,255)",
        //     "pointColor": "rgb(255,0,0)",
        //     "pointStrokeColor": "#fff",
        //     "pointHighlightFill": "#fff",
        //     "pointHighlightStroke": "rgb(255,0,0)"
        // }];
        vm.colors = ['#345fa2']; // '#14243e'
        vm.options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    display: false,
                    gridLines: {
                        display: false,
                    },
                }],
                yAxes: [{
                    display: false,
                    gridLines: {
                        display: false,
                    },
                    ticks: {
                        beginAtZero: true,
                    },
                }],
            },
        };
        vm.onClick = function() { // points, evt
        };
    }
}

module.exports = occurrenceCardDirective;

