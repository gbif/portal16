'use strict';


var angular = require('angular'),
    _ = require('lodash');

require('./occurrenceTaxonomy.resource');

angular
    .module('portal')
    .directive('occurrenceTaxonomy', occurrenceTaxonomyDirective);

/** @ngInject */
function occurrenceTaxonomyDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceTaxonomy/occurrenceTaxonomy.html?v=' + BUILD_VERSION,
        scope: {
            filter: '=',
            options: '='
        },
        //link: chartLink,
        controller: occurrenceTaxonomy,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function chartLink(scope, element) {//, attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function occurrenceTaxonomy($q, Species, $scope, $state, OccurrenceFrequentTaxa, OccurrenceFilter, OccurrenceTaxonSearch) {
        var vm = this;
        vm.fullTree = {children:[], expanded: true};

        function updateTree() {
            if (_.get(vm.frequent, '$cancelRequest')) {
                vm.frequent.$cancelRequest();
            }
            var filter = vm.filter || {};
            var q = _.merge({}, filter, vm.options);
            vm.frequent = OccurrenceFrequentTaxa.query(q);
            vm.tree = undefined;
            vm.frequent.$promise
                .then(function (data) {
                    console.log(data.tree);
                    vm.tree = data.tree;
                })
                .catch(function (err) {
                    console.log(err);
                });
        }

        var ranks = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
        vm.toggleTaxa = function (item) {
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
            } else if(_.isUndefined(e)) {
                return [];
            } else {
                return [e];
            }
        }

        vm.nextRank = function(rank){
            if (!rank) {
                return 'kingdom';
            }
            var nextRank = ranks[ranks.indexOf(rank.toLowerCase()) + 1];
            return nextRank;
        };

        function getRankId(rank) {
            if (!rank) {
                rank = '';
            }
            return ranks.indexOf(rank.toLowerCase());
        }

        function hasTaxonKey(taxon, key, rank) {
            return taxon[rank.toLowerCase() + 'Key'] === key;
        }

        vm.appendTaxa = function (item) {
            item.expanded = true;
            item.state = 'LOADING';
            var filter = vm.filter || {};
            //what taxonkey to filter on? this is tricky as there could be an existing filter on one or more taxa. Depending on what node you expand, the existing filter would have to be included partially, fully or not at all.

            /*
            hvis key i en af eksisterende filters parents:
                fjern alle eksisterende filters der ikke har denne key
            ellers er det et dybere liggende barn eller eks eksakt key
                brug kun denne key
             */

             var customQuery = {offset: item.children.length, limit: 20};
             if (item.key) {
                 var filterKeys = [];
                 vm.filteredTaxa.forEach(function (taxon) {
                     if (hasTaxonKey(taxon, item.key, item.rank)) {
                         filterKeys.push(taxon.key);
                     }
                 });
                 if (filterKeys.length == 0 && item.key) {
                     filterKeys.push(item.key);
                 }
                 customQuery.taxon_key = filterKeys;
            }

            var rank = item.rank || '';
            var nextRank = vm.nextRank(rank);
            if (!nextRank) {
                item.state = undefined;
                item.loading = 'END';
                return;
            }
            customQuery.type = nextRank;
            var query = _.assign({}, filter, customQuery);
            item.loading = true;
            OccurrenceTaxonSearch.query(query, function (data) {
                //item.children = [{scientificName: '234', children: []}, {scientificName: '234', children: []}];
                data.results.forEach(function(e){
                    e.children = [];
                });
                item.children = _.concat(item.children, data.results);
                item.childCount = _.sumBy(item.children, '_count');
                if (item.children.length)
                //item.children.splice(-1, 0, data.results);
                //item.children.push({scientificName: '234', children: []});
                item.endOfRecords = data.endOfRecords;
                item.state = data.endOfRecords ? 'END' : 'MORE';
                item.loading = false;
                if (item.children.length == 1 && data.endOfRecords) {
                    vm.toggleTaxa(item.children[0])
                }
            }, function () {
                //TODO handle request error
            });
        };

        function restartTree() {
            vm.fullTree = {children:[]};
            //Get taxa that is a part of the filter
            var filteredTaxaPromises = asArray(vm.filter.taxon_key).map(function(e){
                return Species.get({id: e});
            });
            vm.filteredTaxa = [];
            $q.all(filteredTaxaPromises)
                .then(function(results){
                    vm.filteredTaxa = results;
                    vm.appendTaxa(vm.fullTree);
                })
                .catch(function(err){
                    console.log(err);
                });
        }
        restartTree();


        vm.search = function (taxonKey) {
            if ($state.current.parent == 'occurrenceSearch') {
                OccurrenceFilter.updateParam('taxon_key', [taxonKey]);
            } else {
                var filter = vm.filter || {};
                var q = _.merge({}, filter, {taxon_key: taxonKey});
                $state.go('occurrenceSearchTable', q);
            }
        };

        //$scope.create = function (element) {
        //    vm.chartElement = element[0].querySelector('.chartArea');
        //    updateChart('month');
        //};

        $scope.$watchCollection(function () {
            return vm.options
        }, function () {
            updateTree();
        });

        $scope.$watchCollection(function () {
            return vm.filter
        }, function () {
            updateTree();
            restartTree();
        });
    }
}

module.exports = occurrenceTaxonomyDirective;
