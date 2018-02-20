'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('vernacularNames', vernacularNamesDirective);

/** @ngInject */
function vernacularNamesDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/vernacularNames.html',
        scope: {
            key: '@',
            isNub: '@'
        },
        controller: vernacularnamesCtrl,
        controllerAs: 'vm',
        bindToController: true
    };
    return directive;

    /** @ngInject */
    function vernacularnamesCtrl($scope, $state, $stateParams, SpeciesVernacularNames) {
        var vm = this;
        // vm.vernacularnames = {
        //     limit: 5,
        //     offset: 0,
        //     endOfRecords: true
        // };

        // vm.endOfRecords = false;
        vm.vernacularNames = SpeciesVernacularNames.get({id: vm.key});
        vm.vernacularNames.$promise.then(function() {
            vm.hasPages = vm.vernacularNames.results.length > 10;
            vm.limit = 10;
            vm.offset = 0;
            vm.endOfRecords = (vm.offset+vm.limit) >= vm.vernacularNames.results.length;
            setHeight();
        });

        function getNames() {

            // vm.vernacularNames = SpeciesVernacularNames.get({id: vm.key})

            // SpeciesReferences.query({
            //     id: vm.key,
            //     limit: vm.vernacularnames.limit || 5,
            //     offset: vm.vernacularnames.offset || 0
            // }, function (data) {
            //     data.results.forEach(function(e){
            //         if (_.isString(e.doi) && e.doi.substr(0,4) !== 'http') {
            //             e.doi = 'https://doi.org/' + e.doi;
            //         }
            //     });
            //     data.hasResults = data.offset > 0 || data.results.length > 0;
            //     vm.vernacularnames = data;
            //     setHeight();
            // }, function () {
            // });
        }

        function updatePageState() {
            vm.offset = parseInt($stateParams.vnOffset) || 0;
        }

      //  updatePageState();
        vm.showDatasets = function(name) {
            vm.currentName = name;
            vm.showCurrentDatasets = true;
        };
        vm.next = function() {
            vm.offset = vm.offset + vm.limit;
            $state.go('.', {vnOffset: vm.offset}, {inherit: true, notify: false, reload: false});
            vm.endOfRecords = (vm.offset+vm.limit) >= vm.vernacularNames.results.length;
            setHeight();
        };

        vm.prev = function() {
            vm.offset = vm.offset - vm.limit;
            $state.go('.', {vnOffset: vm.offset}, {inherit: true, notify: false, reload: false});
            vm.endOfRecords = (vm.offset+vm.limit) >= vm.vernacularNames.results.length;
            setHeight();
        };


        function setHeight() {
            if (vm.offset > 0 || !vm.endOfRecords && _.get(vm.vernacularnames, 'results.length', 0) > 0) {
                var fact = Math.min(vm.vernacularNames.results.length - (vm.offset), 10);
                console.log(fact);
                vm.height = (77 * fact) + 'px';
                vm.hasPages = true;
            }
        }

        vm.getHeight = function() {
            return vm.height;
        };
     }
}

module.exports = vernacularNamesDirective;

