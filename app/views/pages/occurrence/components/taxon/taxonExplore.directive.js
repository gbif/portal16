'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('taxonExplore', taxonExploreDirective);

/** @ngInject */
function taxonExploreDirective() {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/pages/occurrence/components/taxon/taxonExplore.html',
        scope: {
            suggest: '=',
            config: '='
        },
        controller: taxonExplore,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function taxonExplore($state, SpeciesSuggest) {
        var vm = this;
        vm.hide = true;
        vm.scientificName = 'abies';
        vm.suggestions = [];
        vm.activeSuggestion = 0;
        vm.suggest = {selected: [], selectedKeys: []};
        vm.state = $state;

        vm.config = {
            resource: SpeciesSuggest,
            baseQuery: {datasetKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'},
            queryField: 'q',
            matchField: 'canonicalName',
            multiSelect: false,
            key: 'key',
            onChange: function(selected) {
                var taxonKeys = selected.map(function(e) {
                    return e.key;
                });
                vm.query.taxonKey = taxonKeys;
                $state.transitionTo($state.current, vm.query, {location: true, notify: false});
            },
            onCancel: function() {
                vm.hide = true;
            }
        };
        //
        // vm.suggest.addKey = function(key) {
        //    Species.get({id: key}, function(data){
        //        vm.suggest.selectedKeys.push(data.key);
        //        vm.suggest.selected.push(data);
        //    });
        // };
        // if (Array.isArray(vm.query.taxonKey)) {
        //    vm.query.taxonKey.forEach(function(e){
        //        vm.suggest.addKey(e);
        //    });
        // } else if(vm.query.taxonKey) {
        //    vm.suggest.addKey(vm.query.taxonKey);
        // }
        //
        // vm.updateSearch = function() {
        //    $state.go($state.current, vm.query);
        // };
    }
}

module.exports = taxonExploreDirective;

