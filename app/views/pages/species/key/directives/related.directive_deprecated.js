'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('related', relatedDirective);

/** @ngInject */
function relatedDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/related.html',
        scope: {},
        controller: relatedCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@',
            name: '@'
        }
    };
    return directive;

    /** @ngInject */
    function relatedCtrl(SpeciesRelated, OccurrenceSearch) {
        var vm = this;
        vm.numOccDatasets;
        vm.numChkDatasets;

        SpeciesRelated.query({
            id: vm.key,
            limit: 100

        }, function(data) {
            vm.numChkDatasets = data.results.length;
        }, function() {
        });

        OccurrenceSearch.query({
            taxonKey: vm.key,
            limit: 0,
            facetLimit: 100,
            facet: 'datasetKey'

        }, function(data) {
            vm.numOccDatasets = data.facets[0].counts.length;
        }, function() {
        });
    }
}

module.exports = relatedDirective;

