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
    .controller('cmsCtrl', cmsCtrl);

/** @ngInject */
function cmsCtrl($state, hotkeys, enums, CmsFilter, suggestEndpoints) {
    var vm = this;
    vm.state = CmsFilter.getState();

    vm.filters = {};

    vm.filters.type = {
        titleTranslation: 'ocurrenceFieldNames.type',
        queryKey: 'type',
        filter: CmsFilter,
        enumTranslationPath: 'cms.type.',
        showAll: false,
        singleSelect: true,
        enums: enums.cms.type,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'type'
        }
    };

    vm.filters.category_about_gbif = {
        titleTranslation: 'ocurrenceFieldNames.category_about_gbif',
        queryKey: 'category_about_gbif',
        filter: CmsFilter,
        enumTranslationPath: 'cms.category_about_gbif.',
        showAll: false,
        singleSelect: true,
        enums: enums.cms.category_about_gbif,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_about_gbif'
        }
    };

    vm.search = function() {
        $state.go('.', vm.state.query, {inherit:false, notify: true, reload: true});
    };

    vm.updateSearch = function() {
        vm.state.query.offset = undefined;
        vm.state.query.limit = undefined;
        $state.go($state.current, vm.state.query, {inherit:false, notify: false, reload: false});
    };

    vm.searchOnEnter = function(event) {
        if(event.which === 13) {
            vm.updateSearch();
        }
    };

    vm.clearFreetextAndSetFocus = function() {
        document.getElementById('siteSearch').focus();
        vm.freeTextQuery = '';
    };

    //might be interesting to look at: http://chieffancypants.github.io/angular-hotkeys/
    hotkeys.add({
        combo: 'alt+f',
        description: 'Site search',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function(event) {
            vm.clearFreetextAndSetFocus();
            event.preventDefault();
        }
    });

    hotkeys.add({
        combo: 'alt+enter',
        description: 'Apply',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function(event) {
            vm.updateSearch();
            event.preventDefault();
        }
    });

}

module.exports = cmsCtrl;