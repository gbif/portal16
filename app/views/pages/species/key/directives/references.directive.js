'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('references', referencesDirective);

/** @ngInject */
function referencesDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/references.html',
        scope: {},
        controller: referencesCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@'
        }
    };
    return directive;

    /** @ngInject */
    function referencesCtrl(SpeciesReferences) {
        var vm = this;
        vm.references = [];

        var citeFunc = function (r) {
            return r.citation;
        };
        SpeciesReferences.query({
            id: vm.key

        }, function (data) {
            vm.references = _.sortedUniqBy(_.sortBy(data.results, citeFunc), citeFunc);

        }, function () {
        })
    }
}

module.exports = referencesDirective;

