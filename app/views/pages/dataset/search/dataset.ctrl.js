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
    .controller('datasetCtrl', datasetCtrl);

/** @ngInject */
function datasetCtrl($state, DatasetFilter, $http, suggestEndpoints, Species, Publisher, enums, Page, BUILD_VERSION) {
    var vm = this;
    vm.state = DatasetFilter.getState();
    Page.setTitle('Dataset search');
    Page.drawer(true);


    vm.filters = {};

    // facet filters
    vm.filters.type = {
        queryKey: 'type',
        facetKey: 'TYPE',
        title: 'type',
        translationPrefix: 'dataset.search',
        filter: DatasetFilter
    };

    vm.filters.license = {
        titleTranslation: 'stdTerms.license',
        queryKey: 'license',
        filter: DatasetFilter,
        enumTranslationPath: 'license.',
        showAll: true,
        enums: enums.license,
        facets: {
            hasFacets: true,
            facetKey: 'LICENSE'
        }
    };

    vm.filters.taxonKey = {
        titleTranslation: 'ocurrenceFieldNames.scientificName',
        queryKey: 'taxon_key',
        filter: DatasetFilter,
        expand: {
            resource: Species,
            expandedTitle: 'scientificName'
        },
        facets: {
            hasFacets: false,
            facetKey: 'TAXON_KEY'
        },
        search: {
            isSearchable: true,
            placeholder: 'search TRANSLATE',
            suggestEndpoint: suggestEndpoints.taxon,
            defaultParams: {
                datasetKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'
            },
            suggestTemplate: '/templates/components/filterTaxon/suggestTaxonTemplate.html?v=' + BUILD_VERSION,
            suggestTitle: 'scientificName',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };

    vm.filters.publishingCountry = {
        titleTranslation: 'dataset.search.publishingCountry',
        queryKey: 'publishing_country',
        filter: DatasetFilter,
        enumTranslationPath: 'country.',
        search: {
            isSearchable: true,
            placeholder: 'ocurrenceFieldNames.TRANSLATE',
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale + '&v=' + BUILD_VERSION
        },
        facets: {
            hasFacets: true,
            facetKey: 'PUBLISHING_COUNTRY'
        }
    };

    vm.filters.publisher = {
        titleTranslation: 'stdTerms.publisher',
        queryKey: 'publishing_org',
        filter: DatasetFilter,
        expand: {
            resource: Publisher,
            expandedTitle: 'title'
        },
        facets: {
            hasFacets: true,
            facetKey: 'PUBLISHING_ORG'
        },
        search: {
            isSearchable: true,
            placeholder: 'dataset.search.publishingOrg',
            suggestEndpoint: suggestEndpoints.publisher,
            suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
            suggestTitle: 'title',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };

    vm.filters.hostingOrg = {
        titleTranslation: 'dataset.search.hostingOrg',
        queryKey: 'hosting_org',
        filter: DatasetFilter,
        expand: {
            resource: Publisher,
            expandedTitle: 'title'
        },
        facets: {
            hasFacets: true,
            facetKey: 'HOSTING_ORG'
        },
        search: {
            isSearchable: true,
            placeholder: 'dataset.search.hostingOrg',
            suggestEndpoint: suggestEndpoints.publisher,
            suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
            suggestTitle: 'title',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };

    vm.filters.projectId = {
        titleTranslation: 'dataset.search.projectId',
        queryKey: 'project_id',
        filter: DatasetFilter,
        facets: {
            hasFacets: true,
            facetKey: 'PROJECT_ID'
        },
        search: {
            isSearchable: true,
            placeholder: 'dataset.search.projectId'
        }
    };


    vm.search = function() {
        $state.go('.', vm.state.query, {inherit: false, notify: true, reload: true});
    };

    vm.getSuggestions = function(val) {
        return $http.get(suggestEndpoints.dataset, {
            params: {
                q: val,
                limit: 10
            }
        }).then(function(response) {
            return response.data;
        });
    };

    vm.typeaheadSelect = function(item) { //  model, label, event
        window.location.href = '../dataset/' + item.key;
    };

    vm.searchOnEnter = function(event) {
        if (event.which === 13) {
            vm.freeTextSearch();
        }
    };

    vm.hasData = function() {
        return typeof vm.state.data.count !== 'undefined';
    };

    // vm.clearFreetextAndSetFocus = function() {
    //    document.getElementById('siteSearch').focus();
    //    vm.freeTextQuery = '';
    //    event.preventDefault();
    // };
    // might be interesting to look at: http://chieffancypants.github.io/angular-hotkeys/
    // hotkeys.add({
    //    combo: 'alt+f',
    //    description: 'Site search',
    //    callback: function(event) {
    //        vm.clearFreetextAndSetFocus();
    //        event.preventDefault();
    //    }
    // });
}

module.exports = datasetCtrl;

