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
    .controller('speciesListCtrl', speciesListCtrl);

/** @ngInject */
function speciesListCtrl(hotkeys, SpeciesFilter, env, constantKeys, BUILD_VERSION) {
    var vm = this, offset;
    vm.backboneKey = constantKeys.backboneKey;
    vm.state = SpeciesFilter.getState();
    vm.tileApi = env.tileApi;
    vm.dataApi = env.dataApi;
    vm.BUILD_VERSION = BUILD_VERSION;

    //* pagination */
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
        SpeciesFilter.update(vm.state.query);
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

    vm.getVernacularNameMatch = function (species) {
        if (species && angular.isArray(species.vernacularNames)) {
            for (var i = 0; i < species.vernacularNames.length; i++) {
                if (species.vernacularNames[i].vernacularName.indexOf('gbifHl') > -1) {
                    return species.vernacularNames[i];
                }
            }
        }
        return false;
    };


    vm.hasData = function () {
        return typeof vm.state.data.count !== 'undefined'
    };
}

module.exports = speciesListCtrl;

