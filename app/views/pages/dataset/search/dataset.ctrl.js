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
function datasetCtrl($state, DatasetFilter, $stateParams, results, $http) {
    var vm = this;
    vm.query = $stateParams;
    vm.freeTextQuery = $stateParams.q;
    vm.facets = results.facets;
    vm.state = DatasetFilter.state;
    vm.count = results.count;

    //fixed order for facets
    var facetOrder = {
        TYPE: 1,
        PUBLISHING_ORG: 2,
        PUBLISHING_COUNTRY: 3,
        HOSTING_ORG: 4,
        KEYWORD: 5
    };
    vm.sortFacets = function(a) {
        return facetOrder[a.field] || 100;
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
                if (e==value) {
                    return false;
                }
                return true;
            });
        }
        vm.updateSearch();
    }

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
            vm.updateSearch();
        }
    };
}

module.exports = datasetCtrl;

