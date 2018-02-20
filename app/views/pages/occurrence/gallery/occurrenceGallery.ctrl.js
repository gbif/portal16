'use strict';
var angular = require('angular');
require('./galleryImage.directive');

angular
    .module('portal')
    .controller('occurrenceGalleryCtrl', occurrenceGalleryCtrl);

/** @ngInject */
function occurrenceGalleryCtrl($scope, OccurrenceTableSearch, env, OccurrenceFilter) {
    var vm = this,
        limit = 100,
        offset = 0;
    vm.occurrenceState = OccurrenceFilter.getOccurrenceData();
    vm.count = -1;
    vm.failedImageCount = 0;
    vm.results = [];

    vm.imageCache = env.imageCache;

    var latestData = {};

    var search = function(query) {
        query.mediaType = 'stillImage';
        vm.endOfRecords = true;
        if (latestData.$cancelRequest) latestData.$cancelRequest();
        latestData = OccurrenceTableSearch.query(vm.query, function(data) {
            vm.count = data.count;
            vm.endOfRecords = data.endOfRecords;
            data.results.forEach(function(e) {
                // select first image
                e._images = [];
                for (var i = 0; i < e.media.length; i++) {
                    if (e.media[i].type == 'StillImage') {
                        e._images.push(e.media[i]);
                    }
                }
            });

            vm.results = vm.results.concat(data.results);
        }, function() {
            // TODO handle request error
        });
    };

    vm.imageFailed = function() {
        vm.failedImageCount++;
    };

    vm.loadMore = function() {
        vm.query = angular.copy(vm.occurrenceState.query);
        vm.query.limit = limit;
        offset += limit;
        vm.query.offset = offset;
        search(vm.query);
    };

    vm.filter = function(query) {
        vm.query = angular.copy(query);
        vm.query.limit = limit;
        vm.query.offset = 0;
        vm.results = [];
        vm.count = -1;
        vm.failedImageCount = 0;
        search(vm.query);
    };
    vm.filter(vm.occurrenceState.query);

    $scope.$watch(function() {
        return vm.occurrenceState.data;
    }, function() {
        offset = 0;
        vm.filter(vm.occurrenceState.query);
    });
}

module.exports = occurrenceGalleryCtrl;
