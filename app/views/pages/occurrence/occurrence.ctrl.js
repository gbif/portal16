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
function occurrenceCtrl($state, $stateParams, SpeciesSuggest, Species, hotkeys, $http) {
    var vm = this;
    vm.query = angular.copy($stateParams);
    vm.query.basisOfRecord = vm.query.basisOfRecord ? [].concat(vm.query.basisOfRecord) : [];
    vm.query.typeStatus = vm.query.typeStatus ? [].concat(vm.query.typeStatus) : [];

    vm.freeTextQuery = vm.query.q;
    vm.hide = true;
    vm.state = $state;
    vm.collapsed = {
        basisOfRecord: true,
        typeStatus: true
    };

    vm.enums = {
        basisOfRecord: [
            'OBSERVATION',
            'LITERATURE',
            'PRESERVED_SPECIMEN',
            'FOSSIL_SPECIMEN',
            'LIVING_SPECIMEN',
            'HUMAN_OBSERVATION',
            'MACHINE_OBSERVATION',
            'MATERIAL_SAMPLE',
            'UNKNOWN'
        ],
        typeStatus: [
            'ALLOLECTOTYPE',
            'ALLONEOTYPE',
            'ALLOTYPE',
            'COTYPE',
            'EPITYPE',
            'EXEPITYPE',
            'EXHOLOTYPE',
            'EXISOTYPE',
            'EXLECTOTYPE',
            'EXNEOTYPE',
            'EXPARATYPE',
            'EXSYNTYPE',
            'EXTYPE',
            'HAPANTOTYPE',
            'HOLOTYPE',
            'ICONOTYPE',
            'ISOLECTOTYPE',
            'ISONEOTYPE',
            'ISOSYNTYPE',
            'ISOTYPE',
            'LECTOTYPE',
            'NEOTYPE',
            'NOTATYPE',
            'ORIGINALMATERIAL',
            'PARALECTOTYPE',
            'PARANEOTYPE',
            'PARATYPE',
            'PLASTOHOLOTYPE',
            'PLASTOISOTYPE',
            'PLASTOLECTOTYPE',
            'PLASTONEOTYPE',
            'PLASTOPARATYPE',
            'PLASTOSYNTYPE',
            'PLASTOTYPE',
            'SECONDARYTYPE',
            'SUPPLEMENTARYTYPE',
            'SYNTYPE',
            'TOPOTYPE'
        ]
    };



    vm.addTaxonKey = function(key) {
        Species.get({id: key}, function(data){
            //vm.suggest.selectedKeys.push(data.key);
            //vm.suggest.selected.push(data);
            vm.taxonKeyMap[key] = data;
        });
    };
    vm.taxonKeyMap = {};
    vm.query.taxonKey  = vm.query.taxonKey ? [].concat(vm.query.taxonKey) : [];
    vm.query.taxonKey.forEach(function(e){
        vm.addTaxonKey(e);
    });

    vm.search = function() {
        vm.query.q = vm.freeTextQuery;
        $state.go('.', vm.query, {inherit:false, notify: true, reload: true});
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
         if (vm.query.taxonKey.indexOf(item.key) < 0) {
             vm.taxonKeyMap[item.key] = item;
             vm.query.taxonKey.push(item.key);
         }
     };






}

module.exports = occurrenceCtrl;