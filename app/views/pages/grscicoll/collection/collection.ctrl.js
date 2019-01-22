'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('grscicollCollectionCtrl', grscicollCollectionCtrl);

/** @ngInject */
function grscicollCollectionCtrl(Page, $state, $stateParams, CollectionSearch) {
    var vm = this;
    vm.limit = 20;
    vm.offset = parseInt($stateParams.offset);
    vm.q = $stateParams.q;
    Page.drawer(false);
    vm.$state = $state;
    vm.state = {};

    vm.query = function() {
        vm.loading = true;
        vm.error = false;
        vm.data = CollectionSearch.query({q: vm.q, limit: vm.limit, offset: vm.offset || ''}, function(data) {
            vm.error = false;
            vm.loading = false;
            vm.offset = data.offset;
        }, function(err) {
            // TODO handle error
            vm.loading = false;
            vm.error = true;
        });
    };
    vm.query();

    //* pagination */
    function updatePaginationCounts() {
        vm.offset = vm.offset || 0;
        vm.maxSize = 5;
        vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
    }
    updatePaginationCounts();

    vm.pageChanged = function() {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        var query = {q: vm.q, offset: vm.offset};
        $state.go('.', query, {inherit: false, notify: false, reload: false});
        updatePaginationCounts();
        vm.query();
        window.scrollTo(0, 0);
    };
}

module.exports = grscicollCollectionCtrl;
