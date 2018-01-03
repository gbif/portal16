'use strict';

var angular = require('angular');
require('./directives/checklistTaxonomyStats.directive.js');
require('../../../../components/occurrenceChart/occurrenceChart.directive');

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
}

module.exports = datasetStatsCtrl;