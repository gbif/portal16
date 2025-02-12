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
    function typeSpecimenCtrl(OccurrenceTableSearch, constantKeys) {
        var vm = this;
        vm.specimen;

        OccurrenceTableSearch.query({
            taxonKey: vm.key,
            limit: 200,
            // eslint-disable-next-line max-len
            typeStatus: [
                'Isosyntype',
                'Isoparatype',
                'Isoneotype',
                'Isolectotype',
                'Isoepitype',
                'Iconotype',
                'Hypotype',
                'Hapantotype',
                'Extype',
                'Exsyntype',
                'Exparatype',
                'Exneotype',
                'Exlectotype',
                'Exisotype',
                'Exholotype',
                'Exepitype',
                'Epitype',
                'Cotype',
                'Allotype',
                'TypeSeries',
                'Metatype',
                'Clonotype',
                'TypeStrain',
                'SupplementaryType',
                'SecondaryType',
                'Holotype',
                'Syntype',
                'Neotype',
                'Lectotype',
                'Isotype',
                'TypeGenus',
                'TypeSpecies',
                'Type'
            ]
        }, function(data) {
            // remove higher rank matches
            // sort by type
            vm.specimen = _.sortBy(
                _.filter(data.results, function(o) {
                    return o.datasetKey !== constantKeys.dataset.austrian_mycological_society && !_.find(o.issues, function(o) {
                        return o == 'TAXON_MATCH_HIGHERRANK';
                    }) && o.taxonRank === vm.rank;
                }), ['typeStatus', 'year', 'occurrenceID']);
        }, function() {
        });
    }
}

module.exports = typeSpecimenDirective;

