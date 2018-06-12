'use strict';

var angular = require('angular'),
_ = require('lodash');
require('../../../../components/checklistMetrics/checklistTaxonomyStats.directive.js');
require('../../../../components/occurrenceTaxonomyChart/occurrenceTaxonomyStats.directive.js');
require('../../../../components/checklistMetrics/checklistMetrics.directive.js');
require('../../../../components/occurrenceTaxonomyTree/occurrenceTaxonomyTree.directive');

angular
    .module('portal')
    .controller('datasetStatsCtrl', datasetStatsCtrl);

/** @ngInject */
function datasetStatsCtrl($http, $stateParams, $state, env, endpoints, DatasetMetrics) {
    var vm = this;
    vm.key = $stateParams.key;
    vm.taxon_key = $stateParams.taxon_key;
    vm.filter = {datasetKey: vm.key, taxon_key: vm.taxon_key};
    vm.checklistMetrics = DatasetMetrics.get({key: vm.key});

    vm.getDownloads = function() {
        vm.loadingDownloads = true;
        vm.failedToLoadDownloads = false;
        var downloads = $http.get(env.dataApi + endpoints.datasetDownloads + vm.key, {params: {limit: vm.limit, offset: vm.offset, locale: $stateParams.locale}});
        downloads.then(function(response) {
            vm.loadingDownloads = false;
            vm.downloads = response.data;
        }, function() {
            vm.loadingDownloads = false;
            vm.failedToLoadDownloads = true;
        });
    };
    vm.getDownloads();

    vm.api = {};
    vm.options = {
        showHeader: false
    };

    vm.addNewChart = function(dimension) {
        vm.charts.push(
            {
                filter: {dataset_key: vm.key},
                api: {},
                options: {showHeader: false, dimension: dimension, type: 'PIE'}
            }
        );
    };

    vm.charts = [
        {
            api: {},
            config: {dimension: 'issue', secondDimension: '', type: 'BAR', customizable: false, showSettings: true},
            filter: {dataset_key: vm.key, locale: gb.locale},
            customFilter: undefined
        },
        {
            api: {},
            config: {dimension: 'year', secondDimension: '', type: 'LINE', customizable: false, showSettings: true},
            filter: {dataset_key: vm.key, locale: gb.locale},
            customFilter: undefined
        }
    ];
    vm.chartDimension;
    vm.chartFieldTypes = ['month', 'issue', 'country'];


    vm.checklistMetrics.$promise.then(function() {
        vm.checklistCharts = _.filter(_.map(['countByKingdom', 'countByRank', 'countByOrigin', 'countByIssue', 'countExtRecordsByExtension', 'countNamesByLanguage'],
            function(key) {
                var hasMoreThanOneKey = vm.checklistMetrics[key] && Object.keys(vm.checklistMetrics[key]).length > 0;

                if (!hasMoreThanOneKey) {
                    return {show: false};
                }

                var entitiesWithValues = 0;

                angular.forEach(vm.checklistMetrics[key], function(v, k) {
                    if (vm.checklistMetrics[key][k] > 0) {
                        entitiesWithValues++;
                    }
                });

                var type = (['countByOrigin'].indexOf(key) > -1) ? 'PIE' : 'BAR';
                return (entitiesWithValues > 1) ?
                    {
                        dimension: key,
                        api: {},
                        options: {showHeader: true, type: type},
                        show: true
                    } :
                    {
                        show: false

                    };
            }), function(e) {
            return e.show;
        });
    });
}

module.exports = datasetStatsCtrl;
