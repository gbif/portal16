'use strict';

var angular = require('angular');
require('./directives/checklistTaxonomyStats.directive.js');
require('./directives/occurrenceDatasetTaxonomyStats.directive.js');

require('../../../../components/occurrenceChart/occurrenceChart.directive');
require('../../../../components/occurrenceChart/occurrenceChartHeader.directive');
require('../../../../components/occurrenceTaxonomyTree/occurrenceTaxonomyTree.directive');

angular
    .module('portal')
    .controller('datasetStatsCtrl', datasetStatsCtrl);

/** @ngInject */
function datasetStatsCtrl($http, $stateParams, env, endpoints, DatasetMetrics) {
    var vm = this;
    vm.key = $stateParams.key;

    vm.checklistMetrics = DatasetMetrics.get({key: vm.key});

    vm.getDownloads = function () {
        vm.loadingDownloads = true;
        vm.failedToLoadDownloads = false;
        var downloads = $http.get(env.dataApi + endpoints.datasetDownloads + vm.key, {params: {limit: vm.limit, offset: vm.offset, locale: $stateParams.locale}});
        downloads.then(function (response) {
            vm.loadingDownloads = false;
            vm.downloads = response.data;
        }, function () {
            vm.loadingDownloads = false;
            vm.failedToLoadDownloads = true;
        });
    };
    vm.getDownloads();

    vm.api = {};
    vm.options = {
        showHeader: false
    };

    vm.addNewChart = function(dimension){
        console.log(dimension);
        vm.charts.push(
            {
                filter: {dataset_key: vm.key},
                api: {},
                options: {showHeader: false, dimension: dimension, type: 'PIE'}
            }
        );
    };

    vm.charts = [{
        filter: {dataset_key: vm.key},
        api: {},
        options: {showHeader: false, dimension: 'month', type: 'BAR'}
    }];
    vm.chartDimension;
    vm.chartFieldTypes = ['month', 'issue', 'country'];
}

module.exports = datasetStatsCtrl;