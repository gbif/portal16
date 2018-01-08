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
            chartOptions: '='
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
    function occurrenceTaxonomy($scope, $state, OccurrenceFrequentTaxa, OccurrenceFilter) {
        var vm = this;

        function updateTree() {
            if (_.get(vm.frequent, '$cancelRequest')) {
                vm.frequent.$cancelRequest();
            }
            var filter = vm.filter || {};
            var q = _.merge({}, filter, {percentage: 2});
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

        vm.search = function(taxonKey){
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
            return vm.filter
        }, function () {
            updateTree();
        });
    }
}

module.exports = occurrenceTaxonomyDirective;
