'use strict';
var angular = require('angular');

angular
    .module('portal')
    .directive('responsiveImage', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var thinner = 0.6,
                thin = 0.8,
                wide = 1.4,
                wider = 1.8,
                widest= 2.0;

            element.on('load', function() {
                element.parent().css({
                    'background-image': 'url(' + attrs.src +')'
                });
                var ratio = (element[0].naturalWidth)/element[0].naturalHeight;
                // element.parent().attr('data-width', 'wider');
                if (ratio > widest) element.parent().attr('data-width', 'widest');
                else if (ratio > wider && ratio <= widest) element.parent().attr('data-width', 'wider');
                else if (ratio > wide && ratio <= wider) element.parent().attr('data-width', 'wide');
                else if (ratio > thinner && ratio <= thin) element.parent().attr('data-width', 'thin');
                else if (ratio <= thinner) element.parent().attr('data-width', 'thinner');
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
