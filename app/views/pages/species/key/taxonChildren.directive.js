'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('taxonChildren', taxonChildrenDirective);

/** @ngInject */
function taxonChildrenDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/taxonChildren.html',
        scope: {},
        controller: taxonChildrenCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@',
            synonyms: '@'
        }
    };
    return directive;

    /** @ngInject */
    function taxonChildrenCtrl(SpeciesSynonyms, SpeciesChildren) {
        var vm = this;
        vm.children = [];

        if (vm.synonyms == "true") {
            renderChildren(SpeciesSynonyms, vm);
        } else {
            renderChildren(SpeciesChildren, vm);
        }
    }

    function renderChildren(resource, vm){
        resource.query({
            id: vm.key

        }, function (data) {
            console.log(data);
            vm.children = data.results;

        }, function () {
        })
    }

}

module.exports = taxonChildrenDirective;

