/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular');
//require('./components/taxon/taxonExplore.directive');

angular
    .module('portal')
    .controller('occurrenceCtrl', occurrenceCtrl);

/** @ngInject */
function occurrenceCtrl($scope, $state, $stateParams, hotkeys, enums, OccurrenceFilter, suggestEndpoints, Species, Dataset) {
    var vm = this;
    vm.occurrenceState = OccurrenceFilter.getOccurrenceData();

    vm.filters = {};
    //suggest complex
    vm.filters.scientificName = {
        queryKey: 'taxonKey',
        translationPrefix: 'ocurrenceFieldNames',
        title: 'scientificName',
        suggestEndpoint: suggestEndpoints.taxon,
        defaultParams: {
            datasetKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'
        },
        suggestTemplate: '/templates/components/filterTaxon/suggestTaxonTemplate.html',
        shortName: 'canonicalName',
        longName: 'scientificName',
        expand: true,
        resource: Species
    };

    vm.filters.dataset = {
        queryKey: 'datasetKey',
        title: 'dataset',
        translationPrefix: 'stdTerms',
        suggestEndpoint: suggestEndpoints.dataset,
        defaultParams: {},
        suggestTemplate: '/templates/components/filterTaxon/suggestDatasetTemplate.html',
        shortName: 'title',
        longName: 'title',
        expand: false,
        resource: Dataset
    };

    //enums
    vm.filters.basisOfRecord = {
        enumValues: enums.basisOfRecord,
        queryKey: 'basisOfRecord',
        title: 'basisOfRecord',
        translationPrefix: 'basisOfRecord',
        facetKey: 'BASIS_OF_RECORD'
    };

    vm.filters.typeStatus = {
        enumValues: enums.typeStatus,
        queryKey: 'typeStatus',
        title: 'typeStatus',
        translationPrefix: 'typeStatus',
        facetKey: 'TYPE_STATUS'
    };

    vm.filters.month = {
        enumValues: enums.month,
        queryKey: 'month',
        title: 'month',
        translationPrefix: 'month',
        facetKey: 'MONTH'
    };

    vm.filters.mediaType = {
        enumValues: enums.mediaType,
        queryKey: 'mediaType',
        title: 'mediaType',
        translationPrefix: 'mediaType',
        facetKey: 'MEDIA_TYPE'
    };

    vm.filters.establishmentMeans = {
        enumValues: enums.establishmentMeans,
        queryKey: 'establishmentMeans',
        title: 'establishmentMeans',
        translationPrefix: 'establishmentMeans'
    };

    //suggest filters
    vm.filters.recordedBy = {
        title: 'recordedBy'
    };

    vm.filters.recordNumber = {
        title: 'recordNumber'
    };

    vm.filters.occurrenceId = {
        title: 'occurrenceId'
    };

    vm.filters.catalogNumber = {
        title: 'catalogNumber'
    };

    vm.filters.institutionCode = {
        title: 'institutionCode'
    };

    vm.filters.collectionCode = {
        title: 'collectionCode'
    };

    //intervals
    vm.filters.year = {
        queryKey: 'year'
    };


    vm.search = function() {
        $state.go('.', vm.occurrenceState.query, {inherit:false, notify: true, reload: true});
        //window.scrollTo(0,0);
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