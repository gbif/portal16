'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetActivityCtrl', datasetActivityCtrl);

/** @ngInject */
function datasetActivityCtrl($http, $state, $stateParams, env, endpoints, DatasetDownloadStats) {
    var vm = this;
    vm.key = $stateParams.key;

    function updatePaginationCounts() {
        vm.offset = parseInt($stateParams.offset) || 0;
        vm.maxSize = 5;
        vm.limit = parseInt($stateParams.limit) || 20;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
    }

    updatePaginationCounts();

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

    vm.pageChanged = function () {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        $state.go($state.current, {limit: vm.limit, offset: vm.offset}, {inherit: true, notify: true, reload: true});
    };

    vm.openHelpdesk = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true, type: 'QUESTION'});
    };


    //
    //vm.state = 'LOADING';
    //
    //vm.options = {
    //    seriesBarDistance: 10,
    //    reverseData: true,
    //    horizontalBars: true,
    //    high: 100,
    //    low: 0,
    //    axisY: {
    //        offset: 120
    //    },
    //    axisX: {
    //        labelInterpolationFnc: function (value) {
    //            return parseInt(value);
    //        }
    //    },
    //    chartPadding: {
    //        top: 20,
    //        right: 0,
    //        bottom: 20,
    //        left: 0
    //    },
    //    plugins: [
    //        Chartist.plugins.ctAxisTitle({
    //            axisX: {
    //                axisTitle: 'Percentage of downloads',
    //                axisClass: 'ct-axis-title',
    //                offset: {
    //                    x: 0,
    //                    y: 50
    //                },
    //                textAnchor: 'middle'
    //            },
    //            axisY: {
    //                axisTitle: 'Filter',
    //                axisClass: 'ct-axis-title',
    //                offset: {
    //                    x: 0,
    //                    y: 0
    //                },
    //                textAnchor: 'middle',
    //                flipTitle: false
    //            }
    //        })
    //    ]
    //};
    //vm.data = {};
    //DatasetDownloadStats.get({id: vm.key}, function (response) {
    //    vm.stats = response;
    //    vm.data.labels = response.filterCounts.keys.map(function (e) {
    //        return e.displayName;
    //    });
    //    vm.data.labels.push('No filter');
    //    var serie = response.filterCounts.keys.map(function (e) {
    //        return 100 * e.value / response.usedResults;
    //    });
    //    serie.push(response.filterCounts.noFilter);
    //    vm.data.series = [serie];
    //    vm.state = 'LOADED';
    //}, function () {
    //    vm.state = 'FAILED';
    //    toastService.error();
    //});

}

module.exports = datasetActivityCtrl;
