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

    vm.updateSearch = function() {
        $stateParams.q =  vm.freeTextQuery;
        $stateParams.offset =  undefined;
        $stateParams.limit =  undefined;
        $state.go($state.current, $stateParams);
    };

    vm.facetSelected = function(field, value) {
        var param = vm.query[field.toLowerCase()];
        if (angular.isUndefined(param)) {
            vm.query[field.toLowerCase()] = value;
        }
         else if ( angular.isArray(param) ) {
            if (param.indexOf(value) < 0) {
                param.push(value);
            }
        } else {
            if (param !== value) {
                vm.query[field.toLowerCase()] = [vm.query[field.toLowerCase()], value];
            }
        }
        $stateParams.offset =  undefined;
        $stateParams.limit =  undefined;
        $state.go($state.current, vm.query);
    };

    vm.getSuggestions = function(val) {
        return $http.get('//api.gbif.org/v1/dataset/suggest', {
            params: {
                q: val,
                limit: 10
            }
        }).then(function(response){
            return response.data;
            //return response.data.map(function(item){
            //    return item.title;
            //});
        });
    };

    vm.typeaheadSelect = function(item, model, label, event){
        window.location.href = "../dataset/" + item.key;
    };

    vm.searchOnEnter = function(event) {
        if(event.which === 13) {
            vm.updateSearch();
        }
    };
}

module.exports = datasetCtrl;

