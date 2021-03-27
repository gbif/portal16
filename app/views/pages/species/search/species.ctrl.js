'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('speciesCtrl', speciesCtrl);

/** @ngInject */
function speciesCtrl($scope, $state, SpeciesFilter, Species, $translate, Page, suggestEndpoints, Dataset, BUILD_VERSION) {
    var vm = this;
    $translate('speciesSearch.title').then(function(title) {
        Page.setTitle(title);
    });
    Page.drawer(true);
    vm.state = SpeciesFilter.getState();
    vm.$state = $state;
    vm.filters = {};

    // facet filters
    vm.filters.rank = {
        queryKey: 'rank',
        facetKey: 'RANK',
        title: 'rank',
        translationPrefix: 'filterNames',
        filter: SpeciesFilter
    };

    vm.filters.dataset = {
        titleTranslation: 'filterNames.datasetKey',
        queryKey: 'dataset_key',
        filter: SpeciesFilter,
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
            suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
            suggestTitle: 'title',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };

    vm.filters.constituentKey = {
        titleTranslation: 'filterNames.constituentKey',
        queryKey: 'constituent_key',
        filter: SpeciesFilter,
        expand: {
            resource: Dataset,
            expandedTitle: 'title'
        },
        facets: {
            hasFacets: true,
            facetKey: 'CONSTITUENT_KEY'
        },
        search: {
            isSearchable: true,
            suggestEndpoint: suggestEndpoints.dataset,
            suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
            suggestTitle: 'title',
            suggestShortName: 'title',
            suggestKey: 'key'
        }
    };

    vm.filters.highertaxonKey = {
        queryKey: 'highertaxon_key',
        facetKey: 'HIGHERTAXON_KEY',
        title: 'higherTaxonKey',
        translationPrefix: 'filterNames',
        filter: SpeciesFilter
    };

    vm.filters.highertaxonKeyBackbone = {
      titleTranslation: 'filterNames.higherTaxonKey',
      queryKey: 'highertaxon_key',
      filter: SpeciesFilter,
      expand: {
        resource: Species,
        expandedTitle: 'scientificName'
      },
      facets: {
        hasFacets: true,
        facetKey: 'HIGHERTAXON_KEY'
      },
      search: {
        isSearchable: true,
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

    // vm.filters.highertaxonKey = {
    //   titleTranslation: 'filterNames.higherTaxonKey',
    //   queryKey: 'highertaxon_key',
    //   filter: SpeciesFilter,
    //   expand: {
    //     resource: Species,
    //     expandedTitle: 'scientificName'
    //   },
    //   facets: {
    //     hasFacets: true,
    //     facetKey: 'HIGHERTAXON_KEY'
    //   },
    //   search: {
    //     isSearchable: true,
    //     suggestEndpoint: suggestEndpoints.taxon,
    //     suggestTemplate: '/templates/components/filterTaxon/suggestTaxonTemplate.html?v=' + BUILD_VERSION,
    //     suggestTitle: 'scientificName',
    //     suggestShortName: 'title',
    //     suggestKey: 'key'
    //   }
    // };

    vm.filters.status = {
        queryKey: 'status',
        facetKey: 'STATUS',
        title: 'status',
        translationPrefix: 'filterNames',
        filter: SpeciesFilter
    };

    vm.filters.issue = {
        queryKey: 'issue',
        facetKey: 'ISSUE',
        title: 'issue',
        translationPrefix: 'filterNames',
        filter: SpeciesFilter
    };

    vm.filters.nameType = {
        queryKey: 'name_type',
        facetKey: 'NAME_TYPE',
        title: 'nameType',
        translationPrefix: 'filterNames',
        filter: SpeciesFilter
    };

    vm.filters.origin = {
        queryKey: 'origin',
        facetKey: 'ORIGIN',
        title: 'origin',
        translationPrefix: 'filterNames',
        filter: SpeciesFilter
    };
    vm.toggleAdvanced = function() {
        SpeciesFilter.updateParam('advanced', vm.state.query.advanced);
    };

    $scope.$watch(function() {
        return vm.state.query.qField;
    }, function(newval, oldval) {
        if (newval !== oldval) {
            vm.search();
        }
    });
    vm.hasData = function() {
        return typeof vm.state.data.count !== 'undefined';
    };

    vm.search = function() {
        $state.go('.', vm.state.query, {inherit: false, notify: true, reload: true});
    };

    vm.searchOnEnter = function(event) {
        if (event.which === 13) {
            vm.search();
        }
    };
}

module.exports = speciesCtrl;

