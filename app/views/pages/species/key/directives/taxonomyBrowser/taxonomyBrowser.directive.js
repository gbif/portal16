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
    function taxonomyBrowserCtrl($http, $q, $sessionStorage, $state, TaxonomyDetail, TaxonomyRoot, TaxonomyChildren, TaxonomySynonyms, TaxonomyParents, TaxonomyCombinations) {
        var vm = this;
        // default to backbone
        vm.datasetKey = vm.datasetKey || keys.nubKey;
        // if (vm.taxonKey == 'root') {
        //     $http.get('//api.gbif.org/v1/species/root/' + vm.datasetKey)
        //         .then(function (resp) {
        //             console.log(resp);
        //         })
        //         .catch(function (err) {
        //             console.log(err);
        //         });
        // }
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

        vm.getChildren = function (limit, offset) {
            vm.loadingChildren = true;
            var children = TaxonomyChildren.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
                occ: vm.occ,
                limit: limit || 50,
                offset: offset || vm.offsetChildren
            });
            children.$promise
                .then(function (resp) {
                    vm.endOfChildren = vm.endOfChildren || resp.endOfRecords;
                    vm.offsetChildren = children.offset + resp.results.length;
                    processChildren(resp);
                })
                .catch(function () {
                });
            return children;
        };

        function processChildren(children) {
            vm.taxon.$promise.then(function () {
                if (!vm.taxon.synonym) {
                    vm.classifiedChildren = _.concat(vm.classifiedChildren, children.results);
                    //vm.classifiedChildren = _.concat(vm.classifiedChildren, _.filter(children.results, ['rank', vm.nextRank]));
                    //children.results.forEach(function (e) {
                    //    if (e.rank !== vm.nextRank) {
                    //        vm.unclassifiedChildren.push(e);
                    //    }
                    //});
                }
                vm.loadingChildren = false;
            });
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
        vm.getNextRank = function (rank) {
            var next = nextLinneanRank[rank];
            return next ? next : 'UNRANKED';
        };

        if (vm.taxonKey) {
            vm.parents = TaxonomyParents.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
                occ: vm.occ
            });

            var synonyms = TaxonomySynonyms.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey,
                occ: vm.occ
            });

            vm.combinations = TaxonomyCombinations.query({
                taxonKey: vm.taxonKey,
                occ: vm.occ
            })

            vm.classifiedChildren = [];
            vm.unclassifiedChildren = [];
            vm.getChildren(20).$promise
                .then(function (resp) {
                    vm.getChildren(250, resp.results.length);
                });

            // var initialChildren = TaxonomyChildren.query({
            //     datasetKey: vm.datasetKey,
            //     taxonKey: vm.taxonKey,
            //     occ: vm.occ,
            //     limit: 50
            // });

            vm.taxon = TaxonomyDetail.query({
                datasetKey: vm.datasetKey,
                taxonKey: vm.taxonKey
            });

            $q.all([vm.taxon.$promise, vm.combinations.$promise]).then(function(){

                if(vm.taxon.acceptedKey !== vm.taxon.key && vm.combinations.length >0){
                    for(var i=0; i < vm.combinations.length; i++ ){
                        if(vm.combinations[i].key === vm.taxon.acceptedKey){

                            vm.taxon.taxonomicStatus = "HOMOTYPIC_SYNONYM"
                        }
                    }

                    vm.combinations = vm.combinations.filter(function(c){
                        return c.key !== vm.taxon.acceptedKey;
                    })

                }
            });


            vm.taxon.$promise.then(function () {
                vm.nextRank = vm.getNextRank(vm.taxon.rank);

                vm.taxon.$promise.then(function (taxon) {
                    if (taxon.synonym) {
                        vm.acceptedTaxon = TaxonomyDetail.query({
                            datasetKey: vm.datasetKey,
                            taxonKey: vm.taxon.acceptedKey
                        });



                            if(vm.taxon.basionymKey === vm.taxon.acceptedKey){

                                vm.taxon.taxonomicStatus = "HOMOTYPIC_SYNONYM"
                            }


                    }
                }).catch(function () {
                });

                if (!vm.taxon.synonym) {

                    $q.all([synonyms.$promise, vm.combinations.$promise])
                    .then(function (data) {
                        vm.synonyms = data[0].results;
                        var homoTypicSynonymKeys = {};
                        for(var i=0; i < vm.combinations.length; i++ ){
                            homoTypicSynonymKeys[vm.combinations[i].key] = true;
                        }

                        for(var i=0; i < vm.synonyms.length; i++ ){
                            if(homoTypicSynonymKeys[vm.synonyms[i].key] === true || vm.synonyms[i].key === vm.taxon.basionymKey){

                                vm.synonyms[i].taxonomicStatus = "HOMOTYPIC_SYNONYM"
                            }
                        }


                        vm.taxonNumOccurrences = data.numOccurrences;
                    }).catch(function () {
                    });
                }

            }).catch(function () {
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


