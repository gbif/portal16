'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('speciesCtrl', speciesCtrl);

/** @ngInject */
function speciesCtrl($state, SpeciesFilter) {
    var vm = this;
    vm.state = SpeciesFilter.getState();
    vm.filters = {};

    //facet filters
    vm.filters.rank = {
        queryKey: 'rank',
        facetKey: 'RANK',
        title: 'rank',
        translationPrefix: 'taxon',
        filter: SpeciesFilter
    };

    vm.filters.datasetKey = {
        queryKey: 'dataset_key',
        facetKey: 'DATASET_KEY',
        title: 'dataset',
        translationPrefix: 'taxon',
        filter: SpeciesFilter
    };

    vm.filters.constituentKey = {
        queryKey: 'constituent_key',
        facetKey: 'CONSTITUENT_KEY',
        title: 'constituentDataset',
        translationPrefix: 'taxon',
        filter: SpeciesFilter
    };

    vm.filters.highertaxonKey = {
        queryKey: 'highertaxon_key',
        facetKey: 'HIGHERTAXON_KEY',
        title: 'higherTaxon',
        translationPrefix: 'taxon',
        filter: SpeciesFilter
    };

    vm.filters.status = {
        queryKey: 'status',
        facetKey: 'STATUS',
        title: 'status',
        translationPrefix: 'taxon',
        filter: SpeciesFilter
    };

    vm.filters.issue = {
        queryKey: 'issue',
        facetKey: 'ISSUE',
        title: 'issue',
        translationPrefix: 'taxon',
        filter: SpeciesFilter
    };

    vm.filters.nameType = {
        queryKey: 'name_type',
        facetKey: 'NAME_TYPE',
        title: 'nameType',
        translationPrefix: 'taxon',
        filter: SpeciesFilter
    };

    vm.toggleAdvanced = function() {
        SpeciesFilter.updateParam('advanced', vm.state.query.advanced);
    };



    //vm.isSingleDataset = function(){
    //    if (vm.state.data.facets && vm.state.data.facets.DATASET_KEY && vm.state.data.facets.DATASET_KEY.counts && Object.keys(vm.state.data.facets.DATASET_KEY.counts).length == 1) {
    //        return true;
    //    }
    //    return false;
    //};



    vm.search = function() {
        $state.go('.', vm.state.query, {inherit:false, notify: true, reload: true});
    };

     vm.searchOnEnter = function(event) {
         if(event.which === 13) {
             vm.search();
         }
     };
}

module.exports = speciesCtrl;

