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
    .controller('publisherCtrl', publisherCtrl);

/** @ngInject */
function publisherCtrl($state, hotkeys, enums, PublisherFilter, suggestEndpoints) {
    var vm = this;
    vm.state = PublisherFilter.getState();

    vm.filters = {};

    vm.filters.type = {
        titleTranslation: 'ocurrenceFieldNames.type',
        queryKey: 'type',
        filter: PublisherFilter,
        enumTranslationPath: 'publisher.type.',
        showAll: false,
        singleSelect: true,
        enums: enums.publisher.type,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'type'
        }
    };

    vm.filters.category_about_gbif = {
        titleTranslation: 'ocurrenceFieldNames.category_about_gbif',
        queryKey: 'category_about_gbif',
        filter: PublisherFilter,
        enumTranslationPath: 'publisher.category_about_gbif.',
        showAll: false,
        singleSelect: true,
        enums: enums.publisher.category_about_gbif,
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

module.exports = publisherCtrl;