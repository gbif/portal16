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
    .controller('occurrenceCtrl', occurrenceCtrl);

/** @ngInject */
function occurrenceCtrl($state, hotkeys, enums, OccurrenceFilter, suggestEndpoints, Species, Dataset) {
    var vm = this;
    vm.occurrenceState = OccurrenceFilter.getOccurrenceData();

    vm.filters = {};
    //suggest complex
    vm.filters.scientificName = {
        queryKey: 'taxon_key',
        translationPrefix: 'ocurrenceFieldNames',
        title: 'scientificName',
        suggestEndpoint: suggestEndpoints.taxon,
        defaultParams: {
            datasetKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'
        },
        suggestTemplate: '/templates/components/filterTaxon/suggestTaxonTemplate.html',
        shortName: 'canonicalName',
        longName: 'scientificName',
        placeholder: 'search.taxonSearchPlaceholder',
        expand: true,
        resource: Species,
        filter: OccurrenceFilter
    };

    vm.filters.dataset = {
        queryKey: 'dataset_key',
        title: 'dataset',
        translationPrefix: 'stdTerms',
        suggestEndpoint: suggestEndpoints.dataset,
        defaultParams: {},
        suggestTemplate: '/templates/components/filterTaxon/suggestDatasetTemplate.html',
        shortName: 'title',
        longName: 'title',
        placeholder: 'search.datasetSearchPlaceholder',
        expand: false,
        resource: Dataset,
        filter: OccurrenceFilter
    };

    //enums
    vm.filters.basisOfRecord = {
        enumValues: enums.basisOfRecord,
        queryKey: 'basis_of_record',
        title: 'basisOfRecord',
        translationPrefix: 'basisOfRecord',
        facetKey: 'BASIS_OF_RECORD',
        filter: OccurrenceFilter
    };

    vm.filters.typeStatus = {
        enumValues: enums.typeStatus,
        queryKey: 'type_status',
        title: 'typeStatus',
        translationPrefix: 'typeStatus',
        facetKey: 'TYPE_STATUS',
        filter: OccurrenceFilter
    };

    vm.filters.month = {
        enumValues: enums.month,
        queryKey: 'month',
        title: 'month',
        translationPrefix: 'month',
        facetKey: 'MONTH',
        filter: OccurrenceFilter
    };

    vm.filters.issue = {
        enumValues: enums.occurrenceIssue,
        queryKey: 'issue',
        title: 'issue',
        translationPrefix: 'stdTerms',
        facetKey: 'ISSUE',
        filter: OccurrenceFilter
    };

    vm.filters.mediaType = {
        enumValues: enums.mediaType,
        queryKey: 'media_type',
        title: 'mediaType',
        translationPrefix: 'mediaType',
        facetKey: 'MEDIA_TYPE',
        filter: OccurrenceFilter
    };

    vm.filters.establishmentMeans = {
        enumValues: enums.establishmentMeans,
        queryKey: 'establishment_means',
        title: 'establishmentMeans',
        translationPrefix: 'establishmentMeans',
        filter: OccurrenceFilter
    };

    //suggest filters
    vm.filters.recordedBy = {
        title: 'recordedBy',
        queryKey: 'recorded_by',
        filter: OccurrenceFilter
    };

    vm.filters.recordNumber = {
        title: 'recordNumber',
        queryKey: 'record_number',
        filter: OccurrenceFilter
    };

    vm.filters.occurrenceId = {
        title: 'occurrenceId',
        queryKey: 'occurrence_id',
        filter: OccurrenceFilter
    };

    vm.filters.catalogNumber = {
        title: 'catalogNumber',
        queryKey: 'catalog_number',
        filter: OccurrenceFilter
    };

    vm.filters.institutionCode = {
        titleTranslation: 'ocurrenceFieldNames.institutionCode',
        queryKey: 'institution_code',
        filter: OccurrenceFilter,
        facets: {
            hasFacets: true,
            facetKey: 'INSTITUTION_CODE'
        },
        search: {
            isSearchable: true,
            placeholder: 'ocurrenceFieldNames.institutionCode',
            suggestEndpoint: suggestEndpoints.institutionCode
        }
    };

    vm.filters.collectionCode = {
        titleTranslation: 'ocurrenceFieldNames.collectionCode',
        queryKey: 'collection_code',
        filter: OccurrenceFilter,
        search: {
            isSearchable: true,
            placeholder: 'ocurrenceFieldNames.collectionCode',
            suggestEndpoint: suggestEndpoints.collectionCode
        },
        facets: {
            facetKey: 'COLLECTION_CODE'
        }
    };

    vm.filters.dataset = {
        titleTranslation: 'stdTerms.dataset',
        queryKey: 'dataset_key',
        filter: OccurrenceFilter,
        expand: {
            resource: Dataset,
            expandedTitle: 'title'
        },
        facets: {
            hasFacets: true,
            facetKey: 'DATASET_KEY'
        },
        search: {
            isSearchable: true,
            placeholder: 'search TRANSLATE',
            suggestEndpoint: suggestEndpoints.dataset,
            suggestTemplate: '/templates/components/filterTaxon/suggestDatasetTemplate.html',
            suggestTitle: 'title',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };

    vm.filters.taxonKey = {
        titleTranslation: 'ocurrenceFieldNames.scientificName',
        queryKey: 'taxon_key',
        filter: OccurrenceFilter,
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
            suggestTemplate: '/templates/components/filterTaxon/suggestTaxonTemplate.html',
            suggestTitle: 'canonicalName',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };


    vm.filters.organismId = {
        title: 'organismID',
        queryKey: 'organism_id',
        filter: OccurrenceFilter,
        suggestEndpoint: suggestEndpoints.organismId
    };

    vm.filters.waterBody = {
        title: 'waterBody',
        queryKey: 'water_body',
        filter: OccurrenceFilter
    };

    vm.filters.stateProvince = {
        title: 'stateProvince',
        queryKey: 'state_province',
        filter: OccurrenceFilter
    };

    vm.filters.locality = {
        title: 'locality',
        queryKey: 'locality',
        filter: OccurrenceFilter
    };

    //intervals
    vm.filters.year = {
        queryKey: 'year',
        filter: OccurrenceFilter
    };

    vm.toggleAdvanced = function() {
        OccurrenceFilter.updateParam('advanced', vm.occurrenceState.query.advanced);
    };


    vm.search = function() {
        $state.go('.', vm.occurrenceState.query, {inherit:false, notify: true, reload: true});
    };

    vm.updateSearch = function() {
        vm.occurrenceState.query.offset = undefined;
        vm.occurrenceState.query.limit = undefined;
        $state.go($state.current, vm.occurrenceState.query, {inherit:false, notify: false, reload: false});
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

module.exports = occurrenceCtrl;