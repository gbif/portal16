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
function cmsCtrl($state, hotkeys, CmsFilter) {
    var vm = this;
    vm.state = CmsFilter.getState();

    vm.filters = {};

    /**
     * To surface a facet:
     *   1) first include the field name of the facet in app/controllers/api/cms/search/cmsSearch.ctrl.js;
     *   2) create an object below;
     *   3) add a div with filter-cms directive in cms.html
     *   4) add corresponding translations.
     *   5) add facets to routerConfig state for CmsSearch.
     *   6) update app/models/cmsData/expandFacets.js
     * @type {{queryKey: string, filter: *, showAll: boolean, singleSelect: boolean, facets: {hasFacets: boolean, hideBar: boolean, facetKey: string}}}
     */
    vm.filters.type = {
        queryKey: 'type',
        filter: CmsFilter,
        showAll: true,
        singleSelect: true,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'type'
        }
    };

    vm.filters.language = {
        queryKey: 'language',
        filter: CmsFilter,
        showAll: true,
        singleSelect: true,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'language'
        }
    };

    vm.filters.category_data_use = {
        queryKey: 'category_data_use',
        filter: CmsFilter,
        showAll: false,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_data_use'
        }
    };

    vm.filters.category_capacity_enhancement = {
        queryKey: 'category_capacity_enhancement',
        filter: CmsFilter,
        showAll: false,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_capacity_enhancement'
        }
    };

    vm.filters.category_about_gbif = {
        queryKey: 'category_about_gbif',
        filter: CmsFilter,
        showAll: false,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_about_gbif'
        }
    };

    vm.filters.category_audience = {
        queryKey: 'category_audience',
        filter: CmsFilter,
        showAll: false,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_audience'
        }
    };

    vm.filters.category_purpose = {
        queryKey: 'category_purpose',
        filter: CmsFilter,
        showAll: false,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_purpose'
        }
    };

    vm.filters.category_country = {
        queryKey: 'category_country',
        filter: CmsFilter,
        showAll: false,
        search: {
            isSearchable: true,
            placeholder: 'country',
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_country'
        }
    };

    vm.filters.category_about_gbif = {
        queryKey: 'category_about_gbif',
        filter: CmsFilter,
        showAll: false,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_about_gbif'
        }
    };

    vm.filters.category_topic = {
        queryKey: 'category_topic',
        filter: CmsFilter,
        showAll: false,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_topic'
        }
    };

    vm.filters.category_literature_type = {
        queryKey: 'category_literature_type',
        filter: CmsFilter,
        showAll: false,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_literature_type'
        }
    };

    vm.filters.category_gbif_literature_annotation = {
        queryKey: 'category_gbif_literature_annotation',
        filter: CmsFilter,
        showAll: false,
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_gbif_literature_annotation'
        }
    };
    vm.filters.category_author_from_country = {
        queryKey: 'category_author_from_country',
        filter: CmsFilter,
        showAll: false,
        search: {
            isSearchable: true,
            placeholder: 'country',
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_author_from_country'
        }
    };
    vm.filters.category_biodiversity_about_country = {
        queryKey: 'category_biodiversity_about_country',
        filter: CmsFilter,
        showAll: false,
        search: {
            isSearchable: true,
            placeholder: 'country',
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: true,
            hideBar: true,
            facetKey: 'category_biodiversity_about_country'
        }
    };

    vm.search = function () {
        $state.go('.', vm.state.query, {inherit: false, notify: true, reload: true});
    };

    vm.updateSearch = function () {
        vm.state.query.offset = undefined;
        vm.state.query.limit = undefined;
        $state.go($state.current, vm.state.query, {inherit: false, notify: false, reload: false});
    };

    vm.searchOnEnter = function (event) {
        if (event.which === 13) {
            vm.updateSearch();
        }
    };

    vm.clearFreetextAndSetFocus = function () {
        document.getElementById('siteSearch').focus();
        vm.freeTextQuery = '';
    };

    //might be interesting to look at: http://chieffancypants.github.io/angular-hotkeys/
    hotkeys.add({
        combo: 'alt+f',
        description: 'Site search',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event) {
            vm.clearFreetextAndSetFocus();
            event.preventDefault();
        }
    });

    hotkeys.add({
        combo: 'alt+enter',
        description: 'Apply',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event) {
            vm.updateSearch();
            event.preventDefault();
        }
    });

}

module.exports = cmsCtrl;