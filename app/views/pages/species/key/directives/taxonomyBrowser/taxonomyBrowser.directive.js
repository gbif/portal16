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
    // eslint-disable-next-line max-len
    function taxonomyBrowserCtrl($stateParams, $q, $sessionStorage, $state, TaxonomyDetail, TaxonomyRoot, TaxonomyChildren, SpeciesRoot, TaxonomySynonyms, TaxonomyParents, TaxonomyCombinations, SpeciesBulkParsedNames, SpeciesParsedName) {
        var vm = this;
        // default to backbone
        vm.datasetKey = vm.datasetKey || keys.nubKey;
        vm.$state = $state;
        vm.$sessionStorage = $sessionStorage;
        vm.taxon;
        vm.parents;
        vm.endOfChildren = false;
        vm.offsetChildren = 0;
        vm.loadingChildren = false;
        vm.synonyms;
        vm.taxonNumOccurrences;
        vm.linkPrefix = keys.nubKey == vm.datasetKey ? '/species/' : '/dataset/' + vm.datasetKey + '/taxonomy/';
        vm.isOcc = vm.occ == 'true';

        vm.hasCriticalError;
        vm.criticalErrorHandler = function() {
            vm.criticalError = true;
        };

        vm.rootOptions = SpeciesRoot.get({key: vm.datasetKey, limit: 100});
        vm.showRoot = function() {
            vm.showRootSelector = true;
        };
        if ($stateParams.root) {
            vm.showRoot();
        }
        vm.noRootSelector = function() {
            delete $stateParams.root;
            vm.$state.go(vm.$state.current, {}, {reload: true});
        };
        vm.gotoSpecies = function(key) {
            delete $stateParams.root;
            vm.$state.go(vm.$state.current, {speciesKey: key}, {reload: true});
        };

        vm.getChildren = function(limit, offset) {
            vm.loadingChildren = true;
            var children = TaxonomyChildren.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
                occ: vm.occ,
                limit: limit || 50,
                offset: offset || vm.offsetChildren
            });
            children.$promise
                .then(function(resp) {
                    vm.endOfChildren = vm.endOfChildren || resp.endOfRecords;
                    vm.offsetChildren = children.offset + resp.results.length;
                    processChildren(resp);
                    attachParsedNames(resp.results);
                })
                .catch(vm.criticalErrorHandler);
            return children;
        };

        function processChildren(children) {
            vm.taxon.$promise.then(function() {
                if (!vm.taxon.synonym) {
                    vm.classifiedChildren = _.concat(vm.classifiedChildren, children.results);
                }
                vm.loadingChildren = false;
            }).catch(vm.criticalErrorHandler);
        }

        function attachParsedNames(taxa) {
            if (taxa && taxa.length > 0) {
                var taxonKeys = taxa.map(function(r) {
                    return r.key;
                });
                SpeciesBulkParsedNames.get({q: taxonKeys.toString()}).$promise
                    .then(function(nameMap) {
                        for (var i = 0; i < taxa.length; i++) {
                            if (nameMap[taxa[i].key]) {
                                taxa[i]._parsedName = nameMap[taxa[i].key];
                            }
                        }
                    });
            }
        }


        var nextLinneanRank = {
            'KINGDOM': 'PHYLUM',
            'PHYLUM': 'CLASS',
            'CLASS': 'ORDER',
            'ORDER': 'FAMILY',
            'FAMILY': 'GENUS',
            'GENUS': 'SPECIES',
            'SPECIES': 'SUBSPECIES',
            'SUBSPECIES': 'VARIETY',
            'VARIETY': 'SUBVARIETY',
            'SUBVARIETY': 'FORM'
        };
        vm.getNextRank = function(rank) {
            var next = nextLinneanRank[rank];
            return next ? next : 'UNRANKED';
        };

        if (vm.taxonKey) {
            vm.parents = TaxonomyParents.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
                occ: vm.occ
            });

            vm.parents.$promise.then(attachParsedNames);

            var synonyms = TaxonomySynonyms.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
                occ: vm.occ
            });

            synonyms.$promise.then(function(r) {
                attachParsedNames(r.results);
            });

            vm.combinations = TaxonomyCombinations.query({
                taxonKey: vm.taxonKey,
                occ: vm.occ
            });

            vm.combinations.$promise.then(attachParsedNames);

            vm.classifiedChildren = [];
            vm.unclassifiedChildren = [];
            vm.getChildren(20).$promise
                .then(function(resp) {
                    vm.getChildren(250, resp.results.length);
                }).catch(vm.criticalErrorHandler);

            vm.taxon = TaxonomyDetail.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey
            });

            $q.all([vm.taxon.$promise, vm.combinations.$promise]).then(function() {
                if (vm.taxon.acceptedKey !== vm.taxon.key && vm.combinations.length > 0) {
                    for (var i = 0; i < vm.combinations.length; i++) {
                        if (vm.combinations[i].key === vm.taxon.acceptedKey) {
                            vm.taxon.taxonomicStatus = 'HOMOTYPIC_SYNONYM';
                        }
                    }

                    vm.combinations = vm.combinations.filter(function(c) {
                        return c.key !== vm.taxon.acceptedKey;
                    });
                }
            }).catch(vm.criticalErrorHandler);

            vm.taxon.$promise.then(function() {
                vm.nextRank = vm.getNextRank(vm.taxon.rank);

                vm.taxon.$promise.then(function(taxon) {
                    if (taxon.synonym) {
                        vm.acceptedTaxon = TaxonomyDetail.query({
                            datasetKey: vm.datasetKey,
                            taxonKey: vm.taxon.acceptedKey
                        });
                        vm.acceptedTaxon.$promise.then(function() {
                            SpeciesParsedName.get({id: vm.acceptedTaxon.key}).$promise
                                .then(function(res) {
                                    if (res.n) {
                                        vm.acceptedTaxon._parsedName = res.n;
                                    }
                                });
                        });
                        if (vm.taxon.basionymKey === vm.taxon.acceptedKey) {
                            vm.taxon.taxonomicStatus = 'HOMOTYPIC_SYNONYM';
                        }
                    }

                    SpeciesParsedName.get({id: vm.taxon.key}).$promise
                        .then(function(res) {
                            if (res.n) {
                                vm.taxon._parsedName = res.n;
                            }
                        });
                }).catch(vm.criticalErrorHandler);

                if (!vm.taxon.synonym) {
                    $q.all([synonyms.$promise, vm.combinations.$promise])
                        .then(function(data) {
                            var i;
                            vm.synonyms = data[0].results;
                            var homoTypicSynonymKeys = {};
                            for (i = 0; i < vm.combinations.length; i++) {
                                homoTypicSynonymKeys[vm.combinations[i].key] = true;
                            }

                            for (i = 0; i < vm.synonyms.length; i++) {
                                if (homoTypicSynonymKeys[vm.synonyms[i].key] === true || vm.synonyms[i].key === vm.taxon.basionymKey) {
                                    vm.synonyms[i].taxonomicStatus = 'HOMOTYPIC_SYNONYM';
                                }
                            }

                            vm.taxonNumOccurrences = data.numOccurrences;
                        }).catch(vm.criticalErrorHandler);
                }
            }).catch(vm.criticalErrorHandler);
        } else {
            TaxonomyRoot.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
                occ: vm.occ
            }, function(data) {
                vm.children = data.results;
            }, function() {
                vm.criticalErrorHandler();
            });
        }
    }
}

module.exports = taxonomyBrowserDirective;


