'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('synonyms', synonymsDirective);

/** @ngInject */
function synonymsDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/synonyms.html',
        scope: {},
        controller: synonymsCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@'
        }
    };
    return directive;

    /** @ngInject */
    function synonymsCtrl(SpeciesSynonyms) {
        var vm = this;
        vm.children = [];

        SpeciesSynonyms.query({
            id: vm.key

        }, function (data) {
            vm.children = data.results;

        }, function () {
        })
    }
}

module.exports = synonymsDirective;

