'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('taxBrowser', taxBrowserDirective);

/** @ngInject */
function taxBrowserDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/taxBrowser.html',
        scope: {},
        controller: taxBrowserCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@'
        }
    };
    return directive;

    /** @ngInject */
    function taxBrowserCtrl(Species, SpeciesChildren, SpeciesParents) {
        var vm = this;
        vm.taxon;
        vm.parents;
        vm.children;

        Species.query({
            id: vm.key

        }, function (data) {
            vm.taxon = data;

        }, function () {
        });

        SpeciesParents.query({
            id: vm.key

        }, function (data) {
            vm.parents = data;

        }, function () {
        });

        SpeciesChildren.query({
            id: vm.key,
            limit: 100

        }, function (data) {
            vm.children = data.results;


        }, function () {
        })
    }

}

module.exports = taxBrowserDirective;

