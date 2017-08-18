'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('vernacularnames', vernacularnamesDirective);

/** @ngInject */
function vernacularnamesDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/vernacularnames.html',
        scope: {
            names: '=',
            key: '@'
        },
        controller: vernacularnamesCtrl,
        controllerAs: 'vm',
        bindToController: true
    };
    return directive;

    /** @ngInject */
    function vernacularnamesCtrl($scope, $state, $stateParams, SpeciesVernacularNames) {
    //     var vm = this;
    //     vm.vernacularnames = {
    //         limit: 5,
    //         offset: 0,
    //         endOfRecords: true
    //     };
    //     //vm.limit = 5;
    //     //vm.offset = 0;
    //     //vm.endOfRecords = false;
    //     vm.vernacularNames = SpeciesVernacularNames.get({id: vm.key});
    //     function getNames() {
    //
    //         vm.vernacularNames = SpeciesVernacularNames.get({id: vm.key})
    //
    //         // SpeciesReferences.query({
    //         //     id: vm.key,
    //         //     limit: vm.vernacularnames.limit || 5,
    //         //     offset: vm.vernacularnames.offset || 0
    //         // }, function (data) {
    //         //     data.results.forEach(function(e){
    //         //         if (_.isString(e.doi) && e.doi.substr(0,4) !== 'http') {
    //         //             e.doi = 'https://doi.org/' + e.doi;
    //         //         }
    //         //     });
    //         //     data.hasResults = data.offset > 0 || data.results.length > 0;
    //         //     vm.vernacularnames = data;
    //         //     setHeight();
    //         // }, function () {
    //         // });
    //     }
    //
    //     function updatePageState() {
    //         vm.vernacularnames.offset = parseInt($stateParams.vnOffset) || 0;
    //     }
    //
    //     updatePageState();
    //
    //     vm.next = function () {
    //         vm.vernacularnames.offset = vm.vernacularnames.offset + vm.vernacularnames.limit;
    //         $state.go('.', {vnOffset: vm.vernacularnames.offset}, {inherit: true, notify: false, reload: false});
    //         getNames();
    //     };
    //
    //     vm.prev = function () {
    //         vm.vernacularnames.offset = vm.vernacularnames.offset - vm.vernacularnames.limit;
    //         $state.go('.', {vnOffset: vm.vernacularnames.offset}, {inherit: true, notify: false, reload: false});
    //         getNames();
    //     };
    //
    //     $scope.$watch(function () {
    //         return vm.key;
    //     }, function () {
    //         getNames(vm.key);
    //     });
    //
    //     function setHeight() {
    //         if (vm.vernacularnames.offset > 0 || !vm.vernacularnames.endOfRecords && _.get(vm.vernacularnames, 'results.length', 0) > 0) {
    //             vm.height = (77 * 5) + 'px';
    //             vm.hasPages = true;
    //         }
    //     }
    //
    //     vm.getHeight = function () {
    //         return vm.height;
    //     }
     }
}

module.exports = vernacularnamesDirective;

