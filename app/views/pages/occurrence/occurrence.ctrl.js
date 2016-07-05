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
function occurrenceCtrl($state, $stateParams, SpeciesSuggest, Species, OccurrenceFilter, hotkeys) {
    var vm = this;
    vm.query = angular.copy($stateParams);
    vm.freeTextQuery = vm.query.q;
    vm.hide = true;
    vm.scientificName = 'abies';
    vm.suggestions = [];
    vm.activeSuggestion = 0;
    vm.suggest = {selected: [], selectedKeys: []};
    vm.state = $state;
    vm.filters = {
        basisOfRecord: {

        }
    };

    vm.config = {
        resource: SpeciesSuggest,
        baseQuery: {datasetKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'},
        queryField: 'q',
        matchField: 'canonicalName',
        multiSelect: true,
        key: 'key',
        onChange: function(selected){
            var taxonKeys = selected.map(function(e){return e.key;});
            vm.query.taxonKey = taxonKeys;
            OccurrenceFilter.query = vm.query;
            $state.transitionTo($state.current, vm.query);//, {location: true, notify: false});
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
        vm.query.q = vm.freeTextQuery;
        vm.query.offset =  undefined;
        vm.query.limit =  undefined;
        $state.go($state.current, vm.query);
        window.scrollTo(0,0);
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
        callback: function(event) {
            vm.clearFreetextAndSetFocus();
            event.preventDefault();
        }
    });
}

module.exports = occurrenceCtrl;