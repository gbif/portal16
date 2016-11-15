'use strict';

var angular = require('angular'),
    _ = require('lodash'),
    keys = require('../../../../../helpers/constants').keys,
    nsMap = require('../../../../../helpers/namespaces');

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
    function taxBrowserCtrl(TaxonomyDetail, TaxonomyRoot, TaxonomyChildren, TaxonomySynonyms, TaxonomyParents) {
        var vm = this;
        vm.taxon;
        vm.parents;
        vm.children;
        vm.synonyms;
        vm.taxonNumOccurrences;
        vm.linkPrefix = keys.nubKey == vm.datasetKey ? '/species/' : '/dataset/' + vm.datasetKey + '/taxonomy/';
        vm.linkSuffix = keys.nubKey == vm.datasetKey ? '/taxonomy' : '';
        vm.isOcc = vm.occ == 'true';

        if (vm.taxonKey) {
            TaxonomyDetail.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
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
                            taxonKey: vm.taxon.acceptedKey,
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
                    })

                    TaxonomyChildren.query({
                        datasetKey: vm.datasetKey,
                        taxonKey: vm.taxonKey,
                        occ: vm.occ
                    }, function (data) {
                        vm.children = data.results;
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

    function cleanupVerbatim(v) {
        var v2 = {};
        _.forOwn(v, function(val, key) {
            if (_.startsWith(key, 'http')) {
                v2[normTerm(key)]=val;
            }
        });
        v2.extensions={};
        _.forOwn(v.extensions, function(records, eterm){
            var records2 = [];
            _.forEach(records, function(rec){
                var rec2 = {};
                _.forOwn(rec, function(value, term){
                    rec2[normTerm(term)]=value;
                });
                records2.push(rec2);
            });
            v2.extensions[normTerm(eterm)] = records2;
        });
        return v2;

        function normTerm(term) {
            var index = term.lastIndexOf('/');
            var ns    = term.slice(0, index);
            var name  = term.substr(index+1);

            if (ns in nsMap) {
                ns = nsMap[ns]+":";
            } else {
                ns=ns+"/";
            }
            return ns + name;
        }
    }

}

module.exports = taxBrowserDirective;

