'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('typeSpecimen', typeSpecimenDirective);

/** @ngInject */
function typeSpecimenDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/typeSpecimen.html',
        scope: {},
        controller: typeSpecimenCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@',
            rank: '@'
        }
    };
    return directive;

    /** @ngInject */
    function typeSpecimenCtrl(OccurrenceTableSearch) {
        var vm = this;
        vm.specimen;

        OccurrenceTableSearch.query({
            taxonKey: vm.key,
            typeStatus: '*'

        }, function(data) {
            // remove higher rank matches
            // sort by type
            vm.specimen = _.sortBy(
                _.filter(data.results, function(o) {
                    return !_.find(o.issues, function(o) {
                        return o == 'TAXON_MATCH_HIGHERRANK';
                    }) && o.taxonRank === vm.rank;
                }), ['typeStatus', 'year', 'occurrenceID']);
        }, function() {
        });
    }
}

module.exports = typeSpecimenDirective;

