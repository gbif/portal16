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
function datasetCtrl($state, DatasetFilter, $stateParams, $http, hotkeys) {
    var vm = this;
    vm.state = DatasetFilter.getState();

    vm.filters = {};

    //enums
    vm.filters.type = {
        enumValues: ['OCCURRENCE', 'CHECKLIST'],
        queryKey: 'type',
        title: 'type',
        translationPrefix: 'dataset.type',
        filter: DatasetFilter
    };

    //facet filters
    vm.filters.publishingOrg = {
        queryKey: 'publishing_org',
        facetKey: 'PUBLISHING_ORG',
        title: 'publishing_org',
        translationPrefix: 'stdTerms',
        filter: DatasetFilter
    };

    // vm.getSuggestions = function(val) {
    //     return $http.get('//api.gbif.org/v1/dataset/suggest', {
    //         params: {
    //             q: val,
    //             limit: 10
    //         }
    //     }).then(function(response){
    //         return response.data;
    //     });
    // };

    // vm.typeaheadSelect = function(item){ //  model, label, event
    //     window.location.href = "../dataset/" + item.key;
    // };

    // vm.searchOnEnter = function(event) {
    //     if(event.which === 13) {
    //         vm.freeTextSearch();
    //     }
    // };

    // vm.clearFreetextAndSetFocus = function() {
    //     document.getElementById('siteSearch').focus();
    //     vm.freeTextQuery = '';
    //     event.preventDefault();
    // };
    // //might be interesting to look at: http://chieffancypants.github.io/angular-hotkeys/
    // hotkeys.add({
    //     combo: 'alt+f',
    //     description: 'Site search',
    //     callback: function(event) {
    //         vm.clearFreetextAndSetFocus();
    //         event.preventDefault();
    //     }
    // });
}

module.exports = datasetCtrl;

