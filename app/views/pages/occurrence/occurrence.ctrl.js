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
function occurrenceCtrl($state, $stateParams, SpeciesSuggest, Species, OccurrenceFilter, hotkeys, $http) {
    var vm = this;
    vm.query = angular.copy($stateParams);
    vm.query.basisOfRecord = vm.query.basisOfRecord ? [].concat(vm.query.basisOfRecord) : [];
    vm.basisOfRecord = {};
    vm.query.basisOfRecord.forEach(function(e){
        vm.basisOfRecord[e] = true;
    });

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
    vm.occFilter = OccurrenceFilter;

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

    vm.search = function() {
        vm.query.q = vm.freeTextQuery;
        vm.query.basisOfRecord = Object.keys(vm.basisOfRecord)
            .filter(function(e){
                return vm.basisOfRecord[e];
            })
            .map(function(e){
                return e;
            });
        $state.go('.', vm.query, {inherit:false});
        window.scrollTo(0,0);
    };

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










     vm.getSuggestions = function(val) {
         return $http.get('//api.gbif.org/v1/species/suggest', {
             params: {
                 q: val,
                 limit: 10,
                 datasetKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'
             }
         }).then(function(response){
             return response.data;
         });
     };

     vm.typeaheadSelect = function(item){ //  model, label, event
         if (!angular.isArray($stateParams.taxonKey)) {
             $stateParams.taxonKey = $stateParams.taxonKey ? [$stateParams.taxonKey] : [];
         }
         if ($stateParams.taxonKey.indexOf(item.key) < 0) {
             $stateParams.taxonKey.push(item.key);
         }
         $state.go($state.current, $stateParams, {notify: false, reload: true});
     };






}

module.exports = occurrenceCtrl;