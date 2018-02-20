/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('speciesTableCtrl', speciesTableCtrl);

/** @ngInject */
function speciesTableCtrl(hotkeys, SpeciesFilter, env, constantKeys) {
    var vm = this, offset;
    vm.backboneKey = constantKeys.dataset.backbone;
    vm.state = SpeciesFilter.getState();
    vm.tileApi = env.tileApi;
    vm.dataApi = env.dataApi;

    //* pagination */
    function updatePaginationCounts() {
        offset = parseInt(vm.state.query.offset) || 0;
        vm.maxSize = 5;
        vm.limit = parseInt(vm.state.query.limit) || 20;
        vm.currentPage = Math.floor(offset / vm.limit) + 1;
    }

    updatePaginationCounts();

    vm.pageChanged = function() {
        vm.state.query.offset = (vm.currentPage - 1) * vm.limit;
        updatePaginationCounts();
        SpeciesFilter.update(vm.state.query);
        window.scrollTo(0, 0);
    };

    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function() {
            if (offset + vm.limit < vm.state.data.count) {
                vm.currentPage += 1;
                vm.pageChanged();
            }
        }
    });
    hotkeys.add({
        combo: 'alt+left',
        description: 'Previous',
        callback: function() {
            if (offset > 0) {
                vm.currentPage -= 1;
                vm.pageChanged();
            }
        }
    });


    vm.hasData = function() {
        return typeof vm.state.data.count !== 'undefined';
    };
}

module.exports = speciesTableCtrl;

