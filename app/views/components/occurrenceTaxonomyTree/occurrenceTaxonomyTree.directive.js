'use strict';


var angular = require('angular'),
    _ = require('lodash');

require('./occurrenceTaxonomyTree.resource');

angular
    .module('portal')
    .directive('occurrenceTaxonomyTree', occurrenceTaxonomyTreeDirective);

/** @ngInject */
function occurrenceTaxonomyTreeDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceTaxonomyTree/occurrenceTaxonomyTree.html?v=' + BUILD_VERSION,
        scope: {
            filter: '=',
            options: '='
        },
        // link: chartLink,
        controller: occurrenceTaxonomyTree,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    // /** @ngInject */
    // function chartLink(scope, element) {//, attrs, ctrl
    //    scope.create(element);
    // }

    /** @ngInject */
    function occurrenceTaxonomyTree($q, Species, $scope, $state, OccurrenceFrequentTaxa, OccurrenceFilter, OccurrenceBreakdown) {
        var vm = this;
        vm.showFrequenyTree = false;

        function updateTree() {
            if (_.get(vm.frequent, '$cancelRequest')) {
                vm.frequent.$cancelRequest();
            }
            var filter = vm.filter || {};
            var q = _.merge({}, filter, vm.options);
            vm.frequent = OccurrenceFrequentTaxa.query(q);
            vm.tree = undefined;
            vm.frequent._failed = false;
            vm.frequent.$promise
                .then(function(data) {
                    vm.tree = data.tree;
                })
                .catch(function() {
                    vm.frequent._failed = true;
                });
        }

        var ranks = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
        vm.toggleTaxa = function(item) {
            if (item.expanded) {
                item.children = [];
                item.expanded = false;
            } else {
                vm.appendTaxa(item);
            }
        };

        function asArray(e) {
            if (_.isArray(e)) {
                return e;
            } else if (_.isUndefined(e)) {
                return [];
            } else {
                return [e];
            }
        }

        vm.nextRank = function(rank) {
            if (!rank) {
                return 'kingdom';
            }
            var nextRank = ranks[ranks.indexOf(rank.toLowerCase()) + 1];
            return nextRank;
        };

        function hasTaxonKey(taxon, key, rank) {
            return taxon[rank.toLowerCase() + 'Key'] === key;
        }

        vm.appendTaxa = function(item) {
            item.expanded = true;
            item.state = 'LOADING';
            var filter = vm.filter || {};

            var customQuery = {offset: item.children.length, limit: 20};
            var resolvedAndHasKey = item._resolved && typeof item._resolved.key !== 'undefined';
            if (resolvedAndHasKey) {
                var filterKeys = [];
                vm.filteredTaxa.forEach(function(taxon) {
                    if (hasTaxonKey(taxon, item._resolved.key, item._resolved.rank)) {
                        filterKeys.push(taxon.key);
                    }
                });
                filterKeys.push(item._resolved.key);
                customQuery.taxon_key = filterKeys;
            }

            var rank = _.get(item, '_resolved.rank', '');
            var nextRank = vm.nextRank(rank);
            if (!nextRank) {
                item.state = 'END';
                return;
            }
            customQuery.dimension = nextRank + 'Key';
            var query = _.assign({}, filter, customQuery);

            if (_.get(vm.taxonSearchPromise, '$cancelRequest')) {
                vm.taxonSearchPromise.$cancelRequest();
                updateItemState(vm.loadingItem);
                vm.loadingItem.cancelled = true;
            }

            vm.taxonSearchPromise = OccurrenceBreakdown.query(query);
            vm.loadingItem = item;
            vm.loadingItem.cancelled = false;
            vm.taxonSearchPromise.$promise
                .then(function(data) {
                    item.endOfRecords = data.endOfRecords;
                    updateItemState(item);
                    data.results.forEach(function(e) {
                        e.children = [];
                    });
                    item.children = _.concat(item.children, data.results);
                    item.childCount = _.sumBy(item.children, 'count');
                    if (item.children.length == 1 && data.endOfRecords && _.get(item, '_resolved.rank') !== 'GENUS') {
                        vm.toggleTaxa(item.children[0]);
                    }
                })
                .catch(function() {
                    if (!item.cancelled) {
                        item.state = 'FAILED';
                    }
                });
        };

        function updateItemState(item) {
            item.state = item.endOfRecords ? 'END' : 'MORE';
        }

        function restartTree() {
            vm.fullTree = {children: [], expanded: true};
            // Get taxa that is a part of the filter
            var filteredTaxaPromises = asArray(vm.filter.taxon_key).map(function(e) {
                return Species.get({id: e});
            });
            vm.filteredTaxa = [];
            $q.all(filteredTaxaPromises)
                .then(function(results) {
                    vm.filteredTaxa = results;
                    vm.appendTaxa(vm.fullTree);
                })
                .catch(function(err) {
                    console.log(err);
                });
        }

        restartTree();


        vm.search = function(taxonKey) {
            if ($state.current.parent == 'occurrenceSearch') {
                OccurrenceFilter.updateParam('taxon_key', [taxonKey]);
            } else {
                var filter = vm.filter || {};
                var q = _.merge({}, filter, {taxon_key: taxonKey});
                $state.go('occurrenceSearchTable', q);
            }
        };

        $scope.$watchCollection(function() {
            return vm.options;
        }, function() {
            updateTree();
        });

        $scope.$watchCollection(function() {
            return vm.filter;
        }, function() {
            updateTree();
            restartTree();
        });
    }
}

module.exports = occurrenceTaxonomyTreeDirective;
