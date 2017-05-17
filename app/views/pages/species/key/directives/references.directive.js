'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('references', referencesDirective);

/** @ngInject */
function referencesDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/references.html',
        scope: {},
        controller: referencesCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@'
        }
    };
    return directive;

    /** @ngInject */
    function referencesCtrl($state, $stateParams, SpeciesReferences) {
        var vm = this;
        vm.references = {
            limit: 5,
            offset: 0,
            endOfRecords: true
        };
        //vm.limit = 5;
        //vm.offset = 0;
        //vm.endOfRecords = false;

        function getReferences() {
            SpeciesReferences.query({
                id: vm.key,
                limit: vm.references.limit || 5,
                offset: vm.references.offset || 0
            }, function (data) {
                data.results.forEach(function(e){
                    if (_.isString(e.doi) && e.doi.substr(0,4) !== 'http') {
                        e.doi = 'https://doi.org/' + e.doi;
                    }
                });
                vm.references = data;
                setHeight();
            }, function () {
            });
        }

        function updatePageState() {
            vm.references.offset = parseInt($stateParams.refOffset) || 0;
        }
        updatePageState();

        vm.next = function() {
            vm.references.offset = vm.references.offset + vm.references.limit;
            $state.go('.', {refOffset: vm.references.offset}, {inherit: true, notify: false, reload: false});
            getReferences();
        };

        vm.prev = function() {
            vm.references.offset = vm.references.offset - vm.references.limit;
            $state.go('.', {refOffset: vm.references.offset}, {inherit: true, notify: false, reload: false});
            getReferences();
        };

        getReferences();

        function setHeight() {
            if (vm.references.offset > 0 || !vm.references.endOfRecords && _.get(vm.references, 'results.length', 0) > 0) {
                vm.height = (77*5) + 'px';
                vm.hasPages = true;
            }
        }

        vm.getHeight = function(){
            return vm.height;
        }
    }
}

module.exports = referencesDirective;

