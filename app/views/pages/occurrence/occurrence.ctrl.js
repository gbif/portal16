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

    vm.filters.typeStatus = {
        titleTranslation: 'ocurrenceFieldNames.typeStatus',
        queryKey: 'type_status',
        filter: OccurrenceFilter,
        enumTranslationPath: 'typeStatus.',
        showAll: false,
        enums: enums.typeStatus,
        facets: {
            hasFacets: true,
            facetKey: 'TYPE_STATUS'
        }
    };

    vm.filters.issue = {
        titleTranslation: 'ocurrenceFieldNames.issue',
        queryKey: 'issue',
        filter: OccurrenceFilter,
        enumTranslationPath: 'stdTerms.',
        showAll: false,
        enums: enums.occurrenceIssue,
        facets: {
            hasFacets: true,
            facetKey: 'ISSUE'
        }
    };

    vm.filters.mediaType = {
        titleTranslation: 'ocurrenceFieldNames.mediaType',
        queryKey: 'media_type',
        filter: OccurrenceFilter,
        enumTranslationPath: 'mediaType.',
        showAll: true,
        enums: enums.mediaType,
        facets: {
            hasFacets: true,
            facetKey: 'MEDIA_TYPE'
        }
    };

    //suggest filters


    vm.filters.recordedBy = {
        titleTranslation: 'ocurrenceFieldNames.recordedBy',
        queryKey: 'recorded_by',
        filter: OccurrenceFilter,
        search: {
            isSearchable: true,
            placeholder: 'ocurrenceFieldNames.recordedBy',
            suggestEndpoint: suggestEndpoints.recordedBy
        },
        facets: {
            facetKey: 'RECORDED_BY'
        }
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

    //enums 2
    vm.filters.countryCode = {
        titleTranslation: 'ocurrenceFieldNames.countryCode',
        queryKey: 'country',
        filter: OccurrenceFilter,
        enumTranslationPath: 'country.',
        search: {
            isSearchable: true,
            placeholder: 'ocurrenceFieldNames.TRANSLATE',
            suggestEndpoint: '/api/country/suggest.json?lang=' + vm.occurrenceState.query.locale
        },
        facets: {
            hasFacets: true,
            facetKey: 'COUNTRY'
        }
    };

    vm.filters.basisOfRecord = {
        titleTranslation: 'ocurrenceFieldNames.basisOfRecord',
        queryKey: 'basis_of_record',
        filter: OccurrenceFilter,
        enumTranslationPath: 'basisOfRecord.',
        showAll: true,
        enums: enums.basisOfRecord,
        facets: {
            hasFacets: true,
            facetKey: 'BASIS_OF_RECORD'
        }
    };

    vm.filters.month = {
        titleTranslation: 'ocurrenceFieldNames.month',
        queryKey: 'month',
        filter: OccurrenceFilter,
        enumTranslationPath: 'month.',
        showAll: true,
        enums: enums.month,
        facets: {
            hasFacets: true,
            facetKey: 'MONTH'
        }
    };


    /*
    Special suggest with templates and name resolving as the url contains ID's
    it might be worth joining normal suggest and facets with these. Currently it just seemed like a configuration chaos that wouldn't help understanding.
    If these filters grow and it is starting to become a headache aligning them, then this decision should be reconsidered
     */
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