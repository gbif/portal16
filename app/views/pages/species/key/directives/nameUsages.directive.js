'use strict';

var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .directive('nameUsages', nameUsagesDirective);

/** @ngInject */
function nameUsagesDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/nameUsages.html',
        scope: {},
        controller: nameUsagesCtrl,
        controllerAs: 'nameUsages',
        bindToController: {
            species: '=',
            synonyms: '='
        }
    };
    return directive;

    /** @ngInject */
    function nameUsagesCtrl(OccurrenceSearch) {
        var vm = this;
        vm.key = vm.species.key;
        vm.labels = [];
        vm.data = [];
        vm.colors = ['#33691E', '#689F38', '#558B2F', '#7CB342', '#9CCC65', '#8BC34A', '#AED581', '#C5E1A5'];
        vm.options = {
            responsive: true,
            maintainAspectRatio: false,
            labels: true,
            legend: {display: true, position: 'bottom'}
        };
        if(vm.synonyms && vm.synonyms.$promise){
            vm.synonyms.$promise.then(function () {
                OccurrenceSearch.query({taxon_key: vm.key, facet: 'taxon_key', limit: 0}).$promise
                    .then(function (facets) {
                        var usages = _.find(facets.facets, function (f) {
                            return f.field = "TAXON_KEY"
                        }).counts;

                        var totalCount = _.find(usages, function (u) {
                            return u.name = vm.key;
                        })


                        vm.synonymNameUsages = [];
                        angular.forEach(vm.synonyms.results, function (s) {
                            var found = _.find(usages, function (u) {
                                return u.name === s.key.toString() && vm.species.rank === s.rank;
                            })
                            if (found) {
                                found.scientificName = s.scientificName;
                                vm.synonymNameUsages.push(found)
                            }

                        })

                        var totalMinusAccepted = _.reduce(vm.synonymNameUsages, function (sum, n) {
                            return sum + parseInt(n.count);
                        }, 0);
                        vm.data.push(totalCount.count - totalMinusAccepted);
                        vm.labels.push(vm.species.scientificName);

                        for (var i = 0; i < vm.synonymNameUsages.length; i++) {
                            vm.data.push(parseInt(vm.synonymNameUsages[i].count));
                            vm.labels.push(vm.synonymNameUsages[i].scientificName);
                        }


                    });

            })
        }



    }
}

module.exports = nameUsagesDirective;

