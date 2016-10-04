'use strict';
var angular = require('angular');
require('./galleryImage.directive');

angular
    .module('portal')
    .controller('occurrenceGalleryCtrl', occurrenceGalleryCtrl);

/** @ngInject */
function occurrenceGalleryCtrl($scope, OccurrenceSearch, env, OccurrenceFilter) {
    var vm = this,
        limit = 100,
        offset = 0;
    vm.occurrenceState = OccurrenceFilter.getOccurrenceData();
    vm.count = -1;
    vm.results = [];

    //vm.dataApi = env.dataApi; //actual endpoint
    vm.dataApi = 'https://http2-api-test.gbif-uat.org/v1/'; //tmp endpoint TODO http2 and multiple domains. test http2 'https://http2-api-test.gbif-uat.org/v1/';

    var latestData = {};

    var search = function (query) {
        query.mediaType = 'stillImage';
        vm.endOfRecords = true;
        if (latestData.$cancelRequest) latestData.$cancelRequest();
        latestData = OccurrenceSearch.query(vm.query, function (data) {
            vm.count = data.count;
            vm.endOfRecords = data.endOfRecords;
            vm.results = vm.results.concat(data.results);
        }, function () {
            //TODO handle request error
        });
    };

    vm.loadMore = function () {
        vm.query = angular.copy(vm.occurrenceState.query);
        vm.query.limit = limit;
        offset += limit;
        vm.query.offset = offset;
        search(vm.query);
    };


    vm.filter = function (query) {
        vm.query = angular.copy(query);
        vm.query.limit = limit;
        vm.query.offset = 0;
        vm.results = [];
        vm.count = -1;
        search(vm.query);
    };
    vm.filter(vm.occurrenceState.query);

    $scope.$watch(function () {
        return vm.occurrenceState.data
    }, function () {
        offset = 0;
        vm.filter(vm.occurrenceState.query);
    });

}

module.exports = occurrenceGalleryCtrl;
