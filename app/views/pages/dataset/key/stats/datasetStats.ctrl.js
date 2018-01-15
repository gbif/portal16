'use strict';

var angular = require('angular');
require('./directives/checklistTaxonomyStats.directive.js');
require('./directives/occurrenceDatasetTaxonomyStats.directive.js');

require('../../../../components/occurrenceChart/occurrenceChart.directive');
require('../../../../components/occurrenceTaxonomyTree/occurrenceTaxonomyTree.directive');

angular
    .module('portal')
    .controller('datasetStatsCtrl', datasetStatsCtrl);

/** @ngInject */
function datasetStatsCtrl($http, $stateParams, $state, env, endpoints, DatasetMetrics) {
    var vm = this;
    vm.key = $stateParams.key;
    vm.taxon_key = $stateParams.taxon_key;
    vm.filter = {datasetKey: vm.key, taxon_key:  vm.taxon_key};
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

    vm.api = {test: 5};
    vm.exportOptions = [{
        textKey: 'printChart',
        onclick: function () {
            vm.api.print();
        }
    }, {
        separator: true
    }, {
        textKey: 'downloadPNG',
        onclick: function () {
            vm.api.exportChart();
        }
    }];

    vm.sunburstOptions = {
        onZoomToTaxonKey : function(taxon_key){
            $state.go('.', {'taxon_key': taxon_key, 'dataset_key': vm.key}, {inherit: true, notify: false, reload: false});
        },
        onDisplayRootTree: function(){
            delete $stateParams.taxon_key;
            delete vm.taxon_key;
            delete vm.filter.taxon_key;
            $state.go('.', {'dataset_key': vm.key}, {inherit: true, notify: false, reload: false});
        }
    }


}

module.exports = datasetStatsCtrl;