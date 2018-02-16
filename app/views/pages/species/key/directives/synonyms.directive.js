'use strict';

let angular = require('angular');

angular
    .module('portal')
    .directive('synonyms', synonymsDirective);

/** @ngInject */
function synonymsDirective() {
    let directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/synonyms.html',
        scope: {},
        controller: synonymsCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@',
        },
    };
    return directive;

    /** @ngInject */
    function synonymsCtrl(SpeciesSynonyms) {
        let vm = this;
        vm.synonyms;

        SpeciesSynonyms.query({
            id: vm.key,

        }, function(data) {
            // TODO: order by basionym groups (or do on server?)
            vm.synonyms = data.results;
        }, function() {
        });
    }
}

module.exports = synonymsDirective;

