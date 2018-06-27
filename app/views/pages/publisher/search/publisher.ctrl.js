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
function publisherCtrl($state, hotkeys, PublisherFilter, Page) {
    var vm = this;
    Page.setTitle('Publisher search');
    Page.drawer(true);
    vm.state = PublisherFilter.getState();

    vm.filters = {};

    vm.filters.countryCode = {
        titleTranslation: 'filterNames.countryOrArea',
        queryKey: 'country',
        filter: PublisherFilter,
        enumTranslationPath: 'country.',
        singleSelect: true,
        search: {
            isSearchable: true,
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: false,
            facetKey: 'COUNTRY'
        }
    };


    vm.search = function() {
        $state.go('.', vm.state.query, {inherit: false, notify: true, reload: true});
    };

    vm.updateSearch = function() {
        vm.state.query.offset = undefined;
        vm.state.query.limit = undefined;
        $state.go($state.current, vm.state.query, {inherit: false, notify: false, reload: false});
    };

    vm.searchOnEnter = function(event) {
        if (event.which === 13) {
            vm.updateSearch();
        }
    };

    vm.hasData = function() {
        return typeof vm.state.data.count !== 'undefined';
    };

    vm.clearFreetextAndSetFocus = function() {
        document.getElementById('siteSearch').focus();
        vm.freeTextQuery = '';
    };
    // might be interesting to look at: http://chieffancypants.github.io/angular-hotkeys/
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
