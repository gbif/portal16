'use strict';
var angular = require('angular');
require('./galleryImage.directive');

angular
    .module('portal')
    .controller('occurrenceGalleryCtrl', occurrenceGalleryCtrl);

/** @ngInject */
function occurrenceGalleryCtrl($scope, OccurrenceSearch, OccurrenceFilter, env) {
    var vm = this,
        limit = 50,
        offset = 0;
    vm.count = 0;
    vm.results = [];
    vm.dataApi = env.dataApi;

    var search = function(query) {
        query.mediaType = 'stillImage';
        vm.endOfRecords = true;
        OccurrenceSearch.query(vm.query, function (data) {
            vm.count = data.count;
            vm.endOfRecords = data.endOfRecords;
            vm.results = vm.results.concat(data.results);
        }, function () {
            //TODO handle request error
        });
    };

    vm.loadMore = function() {
        vm.query = angular.copy(OccurrenceFilter.query);
        vm.query.limit = limit;
        offset += limit;
        vm.query.offset = offset;
        search(vm.query);
    };


    vm.filter = function() {
        vm.query = angular.copy(OccurrenceFilter.query);
        vm.query.limit = limit;
        vm.query.offset = 0;
        vm.results = [];
        search(vm.query);
    };

    $scope.$watchCollection(OccurrenceFilter.getQuery, function() {
        vm.filter();
    });

}

module.exports = occurrenceGalleryCtrl;
