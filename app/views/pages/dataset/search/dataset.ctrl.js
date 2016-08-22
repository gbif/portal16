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
    .controller('datasetCtrl', datasetCtrl);

/** @ngInject */
function datasetCtrl($state, DatasetFilter, $stateParams, results, $http, hotkeys) {
    var vm = this;
    vm.query = $stateParams;
    vm.freeTextQuery = $stateParams.q;
    vm.facets = results.facets;
    vm.filters = results.filters;
    vm.state = DatasetFilter.state;
    vm.count = results.count;

    //fixed order for facets
    vm.facetOrder = [
        'TYPE',
        'PUBLISHING_ORG',
        'PUBLISHING_COUNTRY',
        'HOSTING_ORG',
        'KEYWORD'
    ];
    vm.sortFacets = function(a) {
        return vm.facetOrder[a.field] || 100;
    };

    vm.freeTextSearch = function() {
        $state.go('.', {q: vm.freeTextQuery}, {inherit:true});
        window.scrollTo(0,0);
    };

    vm.updateSearch = function() {
        $stateParams.q =  vm.freeTextQuery;
        $stateParams.offset =  undefined;
        $stateParams.limit =  undefined;
        $state.go($state.current, $stateParams);
        window.scrollTo(0,0);
    };

    vm.isFacetInQuery = function(field, value) {
        var param = vm.query[field.toLowerCase()];
        if (param === value) {
            return true;
        } else if ( angular.isArray(param) ) {
            if (param.indexOf(value) > -1) {
                return true
            }
        }
        return false;
    };

    vm.addFilter = function(field, value) {
        var param = vm.query[field.toLowerCase()];
        if (angular.isUndefined(param)) {
            vm.query[field.toLowerCase()] = value;
        } else if ( angular.isArray(param) ) {
            if (param.indexOf(value) < 0) {
                param.push(value);
            }
        } else {
            if (param !== value) {
                vm.query[field.toLowerCase()] = [vm.query[field.toLowerCase()], value];
            }
        }
        vm.updateSearch();
    };
    vm.removeFilter = function(field, value) {
        var param = vm.query[field.toLowerCase()];
        if (param == value) {
            vm.query[field.toLowerCase()] = undefined;
        } else if ( angular.isArray(param) ) {
            vm.query[field.toLowerCase()] = param.filter(function(e){
                return e!=value;
            });
        }
        vm.updateSearch();
    };

    vm.getSuggestions = function(val) {
        return $http.get('//api.gbif.org/v1/dataset/suggest', {
            params: {
                q: val,
                limit: 10
            }
        }).then(function(response){
            return response.data;
        });
    };

    vm.typeaheadSelect = function(item){ //  model, label, event
        window.location.href = "../dataset/" + item.key;
    };

    vm.searchOnEnter = function(event) {
        if(event.which === 13) {
            vm.freeTextSearch();
        }
    };

    vm.clearFreetextAndSetFocus = function() {
        document.getElementById('siteSearch').focus();
        vm.freeTextQuery = '';
        event.preventDefault();
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

module.exports = datasetCtrl;

