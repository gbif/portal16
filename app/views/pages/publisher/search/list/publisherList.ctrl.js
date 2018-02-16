'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('publisherListCtrl', publisherListCtrl);

/** @ngInject */
function publisherListCtrl(hotkeys, PublisherFilter, BUILD_VERSION) {
    var vm = this, offset;
    vm.state = PublisherFilter.getState();
    vm.BUILD_VERSION = BUILD_VERSION;

    /* pagination */
    function updatePaginationCounts() {
        offset = parseInt(vm.state.query.offset) || 0;
        vm.maxSize = 5;
        vm.limit = parseInt(vm.state.query.limit) || 20;
        vm.currentPage = Math.floor(offset / vm.limit) + 1;
    }

    updatePaginationCounts();

    vm.pageChanged = function () {
        vm.state.query.offset = (vm.currentPage - 1) * vm.limit;
        updatePaginationCounts();
        PublisherFilter.update(vm.state.query);
        window.scrollTo(0, 0);
    };

    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function () {
            if (offset + vm.limit < vm.state.data.count) {
                vm.currentPage += 1;
                vm.pageChanged();
            }
        }
    });
    hotkeys.add({
        combo: 'alt+left',
        description: 'Previous',
        callback: function () {
            if (offset > 0) {
                vm.currentPage -= 1;
                vm.pageChanged();
            }
        }
    });

    vm.hasData = function () {
        return typeof vm.state.data.count !== 'undefined'
    };

    //http://leafletjs.com/examples/geojson.html
    //https://github.com/johan/world.geo.json/blob/master/countries.geo.json
}

module.exports = publisherListCtrl;

