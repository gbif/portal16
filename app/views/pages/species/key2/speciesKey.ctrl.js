'use strict';

var angular = require('angular'),
    utils = require('../../../shared/layout/html/utils/utils'),
    _ = require('lodash');

require('../key/directives/taxonomyBrowser/taxonomyBrowser.directive.js');
require('../../../components/iucnStatus/iucnStatus.directive.js');
require('../../../components/occurrenceCard/occurrenceCard.directive.js');

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
function speciesKey2Ctrl($state, $stateParams, Species, $http, OccurrenceSearch, SpeciesSearch, SpeciesDescriptions, Dataset, SpeciesCombinations, CitesApi, TaxonomySynonyms, SpeciesRelated) {
    var vm = this;
    vm.key = $stateParams.key;
    vm.$state = $state;
    vm.species = Species.get({id: $stateParams.key});
    vm.occurrences = OccurrenceSearch.query({taxon_key: $stateParams.key});//used for showing button with count in top
    vm.mappedOccurrences = OccurrenceSearch.query({taxon_key: $stateParams.key, has_coordinate: true, has_geospatial_issue: false, limit:0});
    vm.images = OccurrenceSearch.query({taxon_key: $stateParams.key, media_type: 'stillImage', limit: 20});
    vm.images.$promise.then(function(resp){
        utils.attachImages(resp.results);
    });

    vm.species.$promise
        .then(function(resp){
            vm.isSpeciesOrBelow = !!resp.speciesKey;
            var searchRank = vm.isSpeciesOrBelow ? undefined : 'SPECIES';
            vm.subsumedSpecies = SpeciesSearch.query({highertaxon_key: $stateParams.key, rank: searchRank, status: ['ACCEPTED', 'DOUBTFUL'], limit:0});

            vm.dataset = Dataset.get({id:resp.datasetKey});
            getCitesStatus(resp.kingdom, resp.canonicalName);
            getRelatedSources(resp);
        });

    vm.occurrenceQuery = {taxon_key: $stateParams.key};

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
        });

    function getCitesStatus(kingdom, name) {
        vm.cites = CitesApi.get({
            kingdom: kingdom,
            name: name
        });
    }

    function getRelatedSources(species) {
        var kingdom = species.kingdom;
        var keyDatasets = {
            'ZooBank': 'c8227bb4-4143-443f-8cb2-51f9576aff14',
            'WoRMS': '2d59e5db-57ad-41ff-97d6-11f5fb264527'
        };
        var datasetMapping = {
            'Animalia': ['ZooBank', 'WoRMS']
        };
        SpeciesRelated.query({
            id: vm.key,
            limit: 100

        }, function (data) {
            console.log(data);

        }, function () {
        });
    }


    vm.getSuggestions = function (val) {
        return $http.get('//api.gbif.org/v1/species/suggest', {
            params: {
                q: val,
                limit: 10
            }
        }).then(function (response) {
            return response.data;
        });
    };

    vm.typeaheadSelect = function (item) { //  model, label, event
        $state.go($state.current, {key: item.key}, {inherit: false, notify: true, reload: false});
    };



    //latitude test
    vm.getLatitudes = function () {
        $http.get('/api/chart/latitudeDistribution', {
            params: {
                taxon_key: vm.key
            }
        }).then(function (response) {
            vm.latLabels = response.data.labels;
            vm.latData = [response.data.values];
        });
    };
    vm.getLatitudes();
    vm.latLabels = [];
    vm.latSeries = ['Occurrences per latitude'];
    vm.latData = [[]];
    vm.colors = ['#345fa2']; //'#14243e'
    vm.options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            xAxes: [{
                display: true,
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                display: true,
                gridLines: {
                    display: false
                },
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    };
}

module.exports = speciesKey2Ctrl;
