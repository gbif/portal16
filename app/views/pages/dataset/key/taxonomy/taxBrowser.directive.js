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
        templateUrl: '/templates/pages/dataset/key/taxonomy/taxBrowser.html',
        scope: {},
        controller: taxBrowserCtrl,
        controllerAs: 'vm',
        bindToController: {
            occ: '@',
            taxonKey: '@',
            datasetKey: '@'
        }
    };
    return directive;

    /** @ngInject */
    function taxBrowserCtrl(TaxonomyDetail, TaxonomyRoot, TaxonomyChildren, TaxonomyParents) {
        var vm = this;
        vm.taxon;
        vm.parents;
        vm.children;

        if (vm.taxonKey) {
            TaxonomyDetail.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,

            }, function (data) {
                vm.taxon = data;

            }, function () {
            });

            TaxonomyParents.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
                occ: vm.occ

            }, function (data) {
                vm.parents = data;

            }, function () {
            });

            TaxonomyChildren.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
                occ: vm.occ,
                limit: 100

            }, function (data) {
                vm.children = data.results;


            }, function () {
            })

        } else {
            TaxonomyRoot.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
                occ: vm.occ,
                limit: 100

            }, function (data) {
                vm.children = data.results;


            }, function () {
            })
        }
    }

}

module.exports = taxBrowserDirective;

