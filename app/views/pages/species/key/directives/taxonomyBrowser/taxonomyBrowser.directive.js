'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    keys = require('../../../../../../helpers/constants').keys;

angular
    .module('portal')
    .directive('taxonomyBrowser', taxonomyBrowserDirective);

/** @ngInject */
function taxonomyBrowserDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/taxonomyBrowser/taxonomyBrowser.html?v=' + BUILD_VERSION,
        scope: {},
        controller: taxonomyBrowserCtrl,
        controllerAs: 'vm',
        bindToController: {
            occ: '@',
            taxonKey: '@',
            datasetKey: '@'
        }
    };
    return directive;

    /** @ngInject */
    function taxonomyBrowserCtrl(TaxonomyDetail, TaxonomyRoot, TaxonomyChildren, TaxonomySynonyms, TaxonomyParents) {
        var vm = this;
        // default to backbone
        vm.datasetKey = vm.datasetKey || keys.nubKey;
        vm.taxon;
        vm.parents;
        vm.children;
        vm.synonyms;
        vm.taxonNumOccurrences;
        vm.linkPrefix = keys.nubKey == vm.datasetKey ? '/species/' : '/dataset/' + vm.datasetKey + '/taxonomy/';
        vm.isOcc = vm.occ == 'true';

        if (vm.taxonKey) {
            TaxonomyDetail.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey
            }, function (data) {
                vm.taxon = data;

                TaxonomyParents.query({
                    datasetKey: vm.datasetKey,
                    taxonKey: vm.taxonKey,
                    occ: vm.occ
                }, function (parents) {
                    if (vm.taxon.synonym) {
                        // also add accepted taxon as parent
                        TaxonomyDetail.query({
                            datasetKey: vm.datasetKey,
                            taxonKey: vm.taxon.acceptedKey
                        }, function (acc) {
                            parents.push(acc);
                            vm.parents = parents;
                        }, function () {
                        });
                    } else {
                        vm.parents = parents;
                    }
                }, function () {
                });

                if (!vm.taxon.synonym) {
                    TaxonomySynonyms.query({
                        datasetKey: vm.datasetKey,
                        taxonKey: vm.taxonKey,
                        occ: vm.occ
                    }, function (data) {
                        vm.synonyms = data.results;
                        vm.taxonNumOccurrences = data.numOccurrences;
                    }, function () {
                    });

                    vm.classifiedChildren = [];
                    vm.unclassified = {
                        kingdomRank: [],
                        phylumRank: [],
                        classRank: [],
                        orderRank: [],
                        familyRank: [],
                        genusRank: [],
                        speciesRank: []
                    };
                    TaxonomyChildren.query({
                        datasetKey: vm.datasetKey,
                        taxonKey: vm.taxonKey,
                        occ: vm.occ
                    }, function (data) {
                        vm.children = data.results;
                        vm.classifiedChildren = _.filter(data.results, ['rank', 'GENUS']);
                        console.log(vm.classifiedChildren);
                        vm.taxonNumOccurrences = data.numOccurrences;
                    }, function () {
                    })
                }

            }, function () {
            });

        } else {
            TaxonomyRoot.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
                occ: vm.occ
            }, function (data) {
                vm.children = data.results;


            }, function () {
            })
        }
    }

}

module.exports = taxonomyBrowserDirective;

