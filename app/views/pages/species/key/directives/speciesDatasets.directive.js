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
    function speciesDatasetsCtrl($scope, $state, $stateParams, SpeciesChecklistDatasets, SpeciesOccurrenceDatasets, $location, $anchorScroll) {
        var vm = this;
        vm.data = {
            limit: 20,
            offset: 0,
            endOfRecords: true
        };
      //  $anchorScroll.yOffset = 60;
        vm.defaultLimit = 20;
        vm.offsetParam = vm.type.toLowerCase() + "DatasetOffset";
        //vm.limit = 5;
        //vm.offset = 0;
        //vm.endOfRecords = false;

        function getSpeciesDataset() {

            if(vm.type ==="CHECKLIST"){
                vm.data = SpeciesChecklistDatasets.query({id: vm.key, limit: vm.defaultLimit || 20, offset: vm.data.offset || 0})
                    .$promise.then(function(data){
                        vm.data = data;
                        setHeight();

                    });
            } else if(vm.type === "OCCURRENCE"){
                vm.data = SpeciesOccurrenceDatasets.query({id: vm.key, limit: vm.defaultLimit || 20, offset: vm.data.offset || 0})
                    .$promise.then(function(data){
                    vm.data = data;
                    setHeight();

                });
            }
             //   vm.checklistsWithSpecies =
             //   vm.occurrenceDatasetsWithSpecies = SpeciesOccurrenceDatasets.get({id: vm.key});

            // SpeciesReferences.query({
            //     id: vm.key,
            //     limit: vm.data.limit || 5,
            //     offset: vm.data.offset || 0
            // }, function (data) {
            //     data.results.forEach(function(e){
            //         if (_.isString(e.doi) && e.doi.substr(0,4) !== 'http') {
            //             e.doi = 'https://doi.org/' + e.doi;
            //         }
            //     });
            //     data.hasResults = data.offset > 0 || data.results.length > 0;
            //     vm.data = data;
            //     setHeight();
            // }, function () {
            // });
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
            $location.hash(vm.type.toLowerCase()+"Datasets");
            $anchorScroll();
        };

        vm.prev = function() {
            vm.data.offset = vm.data.offset - vm.defaultLimit;
            var params = {};
            params[vm.offsetParam] = vm.data.offset;
            $state.go('.', params, {inherit: true, notify: false, reload: false});
            getSpeciesDataset();
            $location.hash(vm.type.toLowerCase()+"Datasets");
            $anchorScroll();
        };

        $scope.$watch(function () {
            return vm.key;
        }, function () {
            getSpeciesDataset();
        });


        function setHeight() {
            if (vm.data.offset > 0 || !vm.data.endOfRecords && _.get(vm.data, 'results.length', 0) > 0) {
                vm.height = (77*parseInt(vm.data.limit)) + 25 + 'px';
                vm.hasPages = true;
            }
        }
        vm.getHeight = function(){
            return vm.height;
        }
    }
}

module.exports = speciesDatasetsDirective;

