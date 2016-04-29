'use strict';
var angular = require('angular');

angular
    .module('portal')
    .directive('responsiveImage', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.on('load', function() {
                element.parent().css({
                    'background-image': 'url(' + attrs.src +')',
                    'width': element[0].naturalWidth + 'px'
                });
                element.parent().addClass('isValid');
            });
        }
    };
});

angular
    .module('portal')
    .controller('occurrenceGalleryCtrl', occurrenceGalleryCtrl);

/** @ngInject */
function occurrenceGalleryCtrl(OccurrenceSearch, $stateParams) {
    var vm = this,
        limit = 50,
        offset = 0;
    vm.count = 0;
    vm.results = [];

    vm.query = angular.copy($stateParams);

    vm.search = function() {
        vm.query.mediaType = 'stillImage';
        vm.query.limit = limit;
        vm.query.offset = offset;
        vm.endOfRecords = true;
        offset += limit;
        OccurrenceSearch.query(vm.query, function (data) {
            vm.count = data.count;
            vm.endOfRecords = data.endOfRecords;
            vm.results = vm.results.concat(data.results);
        }, function () {
        });
    };

    vm.search();
}

module.exports = occurrenceGalleryCtrl;
