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
function datasetCtrl($state, DatasetFilter, $http, enums) {
    var vm = this;
    vm.state = DatasetFilter.getState();


    vm.filters = {};

    //facet filters
    vm.filters.type = {
        queryKey: 'type',
        facetKey: 'TYPE',
        title: 'type',
        translationPrefix: 'dataset.terms',
        filter: DatasetFilter
    };

    vm.filters.publishingOrg = {
        queryKey: 'publishing_org',
        facetKey: 'PUBLISHING_ORG',
        title: 'publishingOrg',
        translationPrefix: 'dataset.terms',
        filter: DatasetFilter
    };


    vm.filters.hostingOrg = {
        queryKey: 'hosting_org',
        facetKey: 'HOSTING_ORG',
        title: 'hostingOrg',
        translationPrefix: 'dataset.terms',
        filter: DatasetFilter
    };
    vm.filters.publishingCountry = {
        queryKey: 'publishing_country',
        facetKey: 'PUBLISHING_COUNTRY',
        title: 'publishingCountry',
        translationPrefix: 'dataset.terms',
        filter: DatasetFilter
    };




    //vm.filters.publishingCountry = {
    //    titleTranslation: 'ocurrenceFieldNames.publishingCountry',
    //    queryKey: 'publishing_country',
    //    filter: DatasetFilter,
    //    enumTranslationPath: 'country.',
    //    search: {
    //        isSearchable: true,
    //        placeholder: 'ocurrenceFieldNames.TRANSLATE',
    //        suggestEndpoint: '/api/country/suggest.json?lang=' + vm.state.query.locale
    //    },
    //    facets: {
    //        hasFacets: true,
    //        facetKey: 'PUBLISHING_COUNTRY'
    //    }
    //};
    //
    //vm.filters.type = {
    //    titleTranslation: 'ocurrenceFieldNames.type',
    //    queryKey: 'type',
    //    filter: DatasetFilter,
    //    enumTranslationPath: 'dataset.type.',
    //    showAll: true,
    //    enums: enums.datasetType,
    //    facets: {
    //        hasFacets: true,
    //        facetKey: 'TYPE'
    //    }
    //};
    //
    //vm.filters.hostingOrg = {
    //    titleTranslation: 'dataset.terms.hosting_org',
    //    queryKey: 'hosting_org',
    //    filter: DatasetFilter,
    //    search: {
    //        isSearchable: false
    //    },
    //    facets: {
    //        hasFacets: true,
    //        facetKey: 'HOSTING_ORG'
    //    }
    //};


    vm.search = function() {
        $state.go('.', vm.state.query, {inherit:false, notify: true, reload: true});
    };

     vm.getSuggestions = function(val) {
         return $http.get('//api.gbif.org/v1/dataset/suggest', {
             params: {
                 q: val,
                 limit: 10
             }
         }).then(function(response){
             return response.data;
         });
     };

     vm.typeaheadSelect = function(item){ //  model, label, event
         window.location.href = "../dataset/" + item.key;
     };

     vm.searchOnEnter = function(event) {
         if(event.which === 13) {
             vm.freeTextSearch();
         }
     };

     //vm.clearFreetextAndSetFocus = function() {
     //    document.getElementById('siteSearch').focus();
     //    vm.freeTextQuery = '';
     //    event.preventDefault();
     //};
     //might be interesting to look at: http://chieffancypants.github.io/angular-hotkeys/
     //hotkeys.add({
     //    combo: 'alt+f',
     //    description: 'Site search',
     //    callback: function(event) {
     //        vm.clearFreetextAndSetFocus();
     //        event.preventDefault();
     //    }
     //});
}

module.exports = datasetCtrl;

