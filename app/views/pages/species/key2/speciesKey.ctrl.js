'use strict';

var angular = require('angular'),
    utils = require('../../../shared/layout/html/utils/utils');

require('../key/directives/taxonomyBrowser/taxonomyBrowser.directive.js');
require('../key/directives/speciesDatasets.directive.js');
require('../../../components/iucnStatus/iucnStatus.directive.js');
require('../../../components/occurrenceCard/occurrenceCard.directive.js');
require('../../../components/scientificName/scientificName.directive.js');

//require('./directives/cites.directive.js');
//require('./directives/redlist.directive.js');
//require('./directives/dbpedia.directive.js');
//require('./directives/synonyms.directive.js');
//require('./directives/combinations.directive.js');
//require('./directives/taxBrowser.directive.js');
//require('./directives/related.directive.js');
//require('./directives/references.directive.js');
//require('./directives/typeSpecimen.directive.js');

angular
    .module('portal')
    .controller('speciesKey2Ctrl', speciesKey2Ctrl);

/** @ngInject */
function speciesKey2Ctrl($state, $stateParams, Species, $http, DwcExtension, OccurrenceSearch, SpeciesVernacularName, SpeciesSearch, SpeciesDescriptions, SpeciesMedia, SpeciesVerbatim, Dataset, SpeciesCombinations, CitesApi, TaxonomySynonyms, suggestEndpoints, SpeciesRelated, constantKeys, Page, MapCapabilities, BUILD_VERSION) {
    var vm = this;
    Page.setTitle('Species');
    vm.key = $stateParams.speciesKey;
    vm.$state = $state;
    vm.backboneKey = constantKeys.dataset.backbone;
    vm.$state = $state;
    vm.BUILD_VERSION = BUILD_VERSION;
    vm.capabilities = MapCapabilities.get({taxonKey: vm.key});
    vm.species = Species.get({id: vm.key});
    vm.occurrences = OccurrenceSearch.query({taxon_key: vm.key});
    vm.vernacularName = SpeciesVernacularName.get({id: vm.key});
    vm.mappedOccurrences = OccurrenceSearch.query({taxon_key: vm.key, has_coordinate: true, has_geospatial_issue: false, limit:0});
    vm.images = OccurrenceSearch.query({taxon_key: vm.key, media_type: 'stillImage', limit: 20});
    vm.speciesImages = SpeciesMedia.get({id: vm.key, media_type: 'stillImage', limit: 50});

    vm.images.$promise.then(function(resp){
        utils.attachImages(resp.results);
    });

    vm.speciesImages.$promise.then(function(resp){
        utils.attachImages(resp.results);
    });



    vm.isNub = false;

    vm.species.$promise
        .then(function(resp){
            Page.setTitle(vm.species.scientificName);
            vm.isSpeciesOrBelow = !!resp.speciesKey;
            var searchRank = vm.isSpeciesOrBelow ? undefined : 'SPECIES';
            vm.subsumedSpecies = SpeciesSearch.query({highertaxon_key: vm.key, rank: searchRank, status: ['ACCEPTED', 'DOUBTFUL'], limit:0});

            vm.dataset = Dataset.get({id:resp.datasetKey});
            vm.isNub  = vm.species.datasetKey === vm.backboneKey;
            if(!vm.isNub){
                vm.verbatim = SpeciesVerbatim.get({id: vm.key});
                vm.verbatim.$promise.then(function(){
                    vm.verbatimHasExtensions = Object.keys(vm.verbatim.extensions).length > 0;
                })
                vm.dwcextensions = DwcExtension.get();

            }
            // else {
            //     vm.checklistsWithSpecies = DatasetSearch.query({taxonKey:vm.species.key, type: 'CHECKLIST'});
            //     vm.occurrenceDatasetsWithSpecies = SpeciesOccurrenceDatasets.get({id: vm.species.key})
            // }
            vm.isSynonym = typeof vm.species.taxonomicStatus !== 'undefined' && vm.species.taxonomicStatus.indexOf('SYNONYM') > -1 && vm.species.accepted && vm.species.acceptedKey && vm.species.acceptedKey !== vm.species.key;
            getCitesStatus(resp.kingdom, resp.canonicalName);
        });


    vm.occurrenceQuery = {taxon_key: vm.key};

    vm.descriptions = SpeciesDescriptions.get({id: vm.key, limit:100});

    vm.combinations = SpeciesCombinations.query({id: vm.key});


    vm.species.$promise
        .then(function(resp){
            if (!resp.synonym) {
                vm.synonyms = TaxonomySynonyms.query({
                    datasetKey: resp.datasetKey,
                    taxonKey: resp.key
                });
            }
            if (vm.species.sourceTaxonKey) {
                vm.sourceTaxon = Species.get({id: vm.species.sourceTaxonKey});
                vm.sourceTaxon.$promise
                    .then(function(){
                        vm.sourceTaxonExists = true;
                    })
                    .catch(function(){
                        vm.sourceTaxonExists = false;
                    });
            }
        });


    function getCitesStatus(kingdom, name) {
        vm.cites = CitesApi.get({
            kingdom: kingdom,
            name: name
        });
    }

    vm.getSuggestions = function (val) {
        return $http.get(suggestEndpoints.taxon, {
            params: {
                q: val,
                datasetKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
                limit: 10
            }
        }).then(function (response) {
            return response.data;
        });
    };

    vm.typeaheadSelect = function (item) { //  model, label, event
        $state.go($state.current, {speciesKey: item.key}, {inherit: false, notify: true, reload: false});
    };
}

module.exports = speciesKey2Ctrl;
