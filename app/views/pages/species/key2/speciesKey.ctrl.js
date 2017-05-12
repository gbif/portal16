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
    vm.occurrences = OccurrenceSearch.query({taxonKey: $stateParams.key, limit: 0});//used for showing button with count in top

    vm.occurrenceQuery = {taxonKey: $stateParams.key, limit: 0};

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
}

module.exports = speciesKey2Ctrl;
