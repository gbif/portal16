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
function occurrenceCtrl($state, SpeciesSuggest, Species, OccurrenceFilter) {
    var vm = this;
    vm.query = OccurrenceFilter.query;
    vm.hide = true;
    vm.scientificName = 'abies';
    vm.suggestions = [];
    vm.activeSuggestion = 0;
    vm.suggest = {selected: [], selectedKeys: []};
    vm.config = {
        resource: SpeciesSuggest,
        baseQuery: {datasetKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'},
        queryField: 'q',
        matchField: 'canonicalName',
        multiSelect: false,
        key: 'key',
        onChange: function(selected){
            var taxonKeys = selected.map(function(e){return e.key;});
            vm.query.taxonKey = taxonKeys;
            OccurrenceFilter.query = vm.query;
            $state.transitionTo($state.current, vm.query, {location: true, notify: false})
        },
        onCancel: function(){
            vm.hide = true;
        }
    };

    vm.suggest.addKey = function(key) {
        Species.get({id: key}, function(data){
            vm.suggest.selectedKeys.push(data.key);
            vm.suggest.selected.push(data);
        });
    };
    if (Array.isArray(vm.query.taxonKey)) {
        vm.query.taxonKey.forEach(function(e){
            vm.suggest.addKey(e);
        });
    } else if(vm.query.taxonKey) {
        vm.suggest.addKey(vm.query.taxonKey);
    }

    vm.updateSearch = function() {
        $state.go($state.current, vm.query);
    };
}

module.exports = occurrenceCtrl;