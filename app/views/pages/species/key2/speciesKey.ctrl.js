'use strict';

var angular = require('angular');
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
function speciesKey2Ctrl($state, $stateParams, Species, $http, OccurrenceSearch) {
    var vm = this;
    vm.key = $stateParams.key;
    vm.species = Species.get({id: $stateParams.key});
    vm.occurrences = OccurrenceSearch.query({taxon_key: $stateParams.key});//used for showing button with count in top

    vm.occurrenceQuery = {taxon_key: $stateParams.key};

    //vm.key = gb.taxon.key;
    //vm.name = gb.taxon.name;
    //vm.rank = gb.taxon.rank;
    //vm.synonym = gb.taxon.synonym;

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
                display: false,
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                display: false,
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
