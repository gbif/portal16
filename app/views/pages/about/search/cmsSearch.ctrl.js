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
    .controller('cmsSearchCtrl', cmsSearchCtrl);

/** @ngInject */
function cmsSearchCtrl($state, DatasetFilter, $stateParams, results, $http, hotkeys) {
    var vm = this;
    vm.query = $stateParams;
    vm.freeTextQuery = $stateParams.q;
    vm.facets = results.facets;
    vm.state = DatasetFilter.state;
    vm.count = results.count;
    vm.appliedFilterCount = 0;

    //fixed order for facets
    var facetOrder = {
        type: 1,
        language: 2,
        category_informatics: 3,
        category_data_use: 4,
        category_capacity_enhancement: 5,
        category_about_gbif: 6,
        category_audience: 7,
        category_purpose: 8,
        category_data_type: 9,
        category_resource_type: 10,
        category_country: 11,
        category_topic: 12,
        category_tags: 13
    };
    vm.sortFacets = function(a) {
        return facetOrder[a.field] || 100;
    };

    vm.getFilterCount = function() {
        var c = 0;
        Object.keys($stateParams).forEach(function(e){
            var v = $stateParams[e];
            if (typeof v !== 'undefined' && e != 'locale' && e != 'q') {
                c++;
            }
        });
        return c;
    };
    vm.appliedFilterCount = vm.getFilterCount();

    vm.freeTextSearch = function() {
        $state.go('.', {q: vm.freeTextQuery}, {inherit:false});
        window.scrollTo(0,0);
    };

    vm.updateSearch = function() {
        $stateParams.q = vm.freeTextQuery;
        $stateParams.offset = undefined;
        $stateParams.limit = undefined;
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
        return $http.get('//cms.gbif-dev.org/api/v2/search/' + val, {
            params: {
                range: 10
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

module.exports = cmsSearchCtrl;

