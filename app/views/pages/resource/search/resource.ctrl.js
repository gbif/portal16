'use strict';
var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('resourceCtrl', resourceCtrl);

/** @ngInject */
function resourceCtrl($state, ResourceFilter, $rootScope, Dataset, Publisher, suggestEndpoints, Page, enums, NAV_EVENTS, BUILD_VERSION) {
    var vm = this;
    vm.state = ResourceFilter.getState();
    Page.setTitle('Resource search');
    Page.drawer(true);
    vm.filters = {};

    vm.filters.countriesOfCoverage = {
        titleTranslation: 'enums.cms.vocabularyTypes.countriesOfCoverage',
        queryKey: 'countriesOfCoverage',
        filter: ResourceFilter,
        enumTranslationPath: 'country.',
        search: {
            isSearchable: true,
            placeholder: 'ocurrenceFieldNames.TRANSLATE',
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: true,
            facetKey: 'COUNTRIES_OF_COVERAGE'
        }
    };

    vm.filters.countriesOfResearcher = {
        titleTranslation: 'enums.cms.vocabularyTypes.countriesOfResearcher',
        queryKey: 'countriesOfResearcher',
        filter: ResourceFilter,
        enumTranslationPath: 'country.',
        search: {
            isSearchable: true,
            placeholder: 'ocurrenceFieldNames.TRANSLATE',
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: true,
            facetKey: 'COUNTRIES_OF_RESEARCHER'
        }
    };

    vm.filters.contractCountry = {
        titleTranslation: 'enums.cms.vocabularyTypes.contractCountry',
        queryKey: 'contractCountry',
        filter: ResourceFilter,
        enumTranslationPath: 'country.',
        search: {
            isSearchable: true,
            placeholder: 'ocurrenceFieldNames.TRANSLATE',
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
        },
        facets: {
            hasFacets: true,
            facetKey: 'COUNTRY_COVERAGE'
        }
    };

    vm.filters.contentType = {
        queryKey: 'contentType',
        facetKey: 'CONTENT_TYPE',
        title: 'contentType',
        translationPrefix: 'enums.cms.vocabularyTypes',
        filter: ResourceFilter
    };

    vm.filters.year = {
        titleTranslation: 'ocurrenceFieldNames.year',
        intervalTranslation: 'intervals.year.',
        queryKey: 'year',
        filter: ResourceFilter,
        singleSelect: true,
        range: {
            'min': [2000, 1],
            'max': [new Date().getFullYear()]
        }
    };


    var facetedEnumFilters = ['purposes', 'topics', 'literatureType', 'relevance', 'audiences'];
    facetedEnumFilters.forEach(function(e) {
        vm.filters[e] = {
            titleTranslation: 'enums.cms.vocabularyTypes.' + e,
            queryKey: e,
            filter: ResourceFilter,
            enumTranslationPath: 'enums.cms.vocabularyTerms.' + e + '.',
            showAll: true,
            enums: enums.cms[e],
            reversible: true,
            multiSelect: true,
            facets: {
                hasFacets: true,
                facetKey: _.toUpper(_.snakeCase(e))
            }
        };
    });

    vm.filters.dataset = {
        titleTranslation: 'stdTerms.dataset',
        queryKey: 'gbifDatasetKey',
        filter: ResourceFilter,
        expand: {
            resource: Dataset,
            expandedTitle: 'title'
        },
        facets: {
            hasFacets: false
        },
        search: {
            isSearchable: true,
            placeholder: 'search TRANSLATE',
            suggestEndpoint: suggestEndpoints.dataset,
            suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
            suggestTitle: 'title',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };

    vm.filters.publisher = {
        titleTranslation: 'stdTerms.publisher',
        queryKey: 'publishingOrganizationKey',
        filter: ResourceFilter,
        expand: {
            resource: Publisher,
            expandedTitle: 'title'
        },
        facets: {
            hasFacets: false
        },
        search: {
            isSearchable: true,
            placeholder: 'search TRANSLATE',
            suggestEndpoint: suggestEndpoints.publisher,
            suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
            suggestTitle: 'title',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };

    vm.filters.gbifDownloadKey = {
        titleTranslation: 'filters.gbifDownloadKey',
        queryKey: 'gbifDownloadKey',
        filter: ResourceFilter,
        search: {
            isSearchable: true,
            placeholder: 'filters.gbifDownloadKey'
        },
        facets: {
            hasFacets: false,
            facetKey: 'GBIF_DOWNLOAD_KEY'
        }
    };

    vm.filters.peerReview = {
        titleTranslation: 'filters.peerReview.title',
        queryKey: 'peerReview',
        filter: ResourceFilter
    };

    vm.filters.openAccess = {
        titleTranslation: 'filters.openAccess.title',
        queryKey: 'openAccess',
        filter: ResourceFilter
    };

    vm.openHelpdesk = function() {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true, type: 'QUESTION'});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
    };

    vm.search = function() {
        $state.go('.', vm.state.query, {inherit: false, notify: true, reload: true});
    };

    vm.hasData = function() {
        return typeof vm.state.data.count !== 'undefined';
    };

    vm.isTabShown = function(contentType) {
        if (vm.state.query.contentType == contentType) {
            return true;
        }
        if (_.get(vm, 'state.facetMultiselect.facets.CONTENT_TYPE.counts.' + contentType + '.count', 0) > 0) {
            return true;
        }
        return false;
    };
}

module.exports = resourceCtrl;
