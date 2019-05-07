'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('speciesDatasets', speciesDatasetsDirective);

/** @ngInject */
function speciesDatasetsDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/speciesDatasets.html',
        scope: {
            key: '@',
            type: '@'
        },
        controller: speciesDatasetsCtrl,
        controllerAs: 'vm',
        bindToController: true
    };
    return directive;

    /** @ngInject */
    function speciesDatasetsCtrl($scope, $state, $stateParams, SpeciesChecklistDatasets, SpeciesOccurrenceDatasets, $location, $anchorScroll, SpeciesBulkParsedNames) {
        var vm = this;
        vm.data = {
            limit: 10,
            offset: 0,
            endOfRecords: true
        };
        vm.defaultLimit = 10;
        vm.offsetParam = vm.type.toLowerCase() + 'DatasetOffset';

        function attachParsedNames(data) {
            if (data && data.length > 0) {
                var taxonKeys = _.chain(data)
                .filter(function(e) {
                    return e._relatedTaxon !== undefined;
                }).map(function(r) {
                    return r._relatedTaxon.key;
                })
                .value();

                SpeciesBulkParsedNames.get({q: taxonKeys.toString()}).$promise
                    .then(function(nameMap) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i]._relatedTaxon && nameMap[data[i]._relatedTaxon.key]) {
                                data[i]._relatedTaxon._parsedName = nameMap[data[i]._relatedTaxon.key];
                            }
                        }
                    });
            }
        }

        function getSpeciesDataset() {
            if (vm.type === 'CHECKLIST') {
                vm.data = SpeciesChecklistDatasets.query({id: vm.key, limit: vm.defaultLimit, offset: vm.data.offset || 0})
                    .$promise.then(function(data) {
                        vm.data = data;
                        setHeight();
                        attachParsedNames(data.results);
                    });
            } else if (vm.type === 'OCCURRENCE') {
                vm.data = SpeciesOccurrenceDatasets.query({id: vm.key, limit: vm.defaultLimit, offset: vm.data.offset || 0})
                    .$promise.then(function(data) {
                    vm.data = data;
                    setHeight();
                });
            }
        }

        function updatePageState() {
            vm.data.offset = parseInt($stateParams[vm.offsetParam]) || 0;
        }
        updatePageState();

        vm.next = function() {
            vm.data.offset = vm.data.offset + vm.data.limit;
            var params = {};
            params[vm.offsetParam] = vm.data.offset;
            $state.go('.', params, {inherit: true, notify: false, reload: false});
            getSpeciesDataset();
            $location.hash(vm.type.toLowerCase() + 'Datasets');
            $anchorScroll();
        };

        vm.prev = function() {
            vm.data.offset = vm.data.offset - vm.defaultLimit;
            var params = {};
            params[vm.offsetParam] = vm.data.offset;
            $state.go('.', params, {inherit: true, notify: false, reload: false});
            getSpeciesDataset();
            $location.hash(vm.type.toLowerCase() + 'Datasets');
            $anchorScroll();
        };

        $scope.$watch(function() {
            return vm.key;
        }, function() {
            getSpeciesDataset();
        });


        function setHeight() {
            if (vm.data.offset > 0 || !vm.data.endOfRecords && _.get(vm.data, 'results.length', 0) > 0) {
                vm.height = (77 * vm.data.results.length) + 25 + 'px';
                vm.hasPages = true;
            }
        }
        vm.getHeight = function() {
            return vm.height;
        };
    }
}

module.exports = speciesDatasetsDirective;

