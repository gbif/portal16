'use strict';

var angular = require('angular'),
_ = require('lodash');

angular
    .module('portal')
    .directive('sequence', sequenceDirective);

/** @ngInject */
function sequenceDirective() {
    var directive = {
        restrict: 'E',
        template: '<div><span style="font-weight: bold" ng-if="vm.marker">DNA, {{vm.marker}}: </span><span class="sequence" ng-bind-html="vm.html">{{vm.sequence}}</span><a class="text-right small shorten__more" ng-if="vm.shorten" href="" ng-click="vm.format(vm.sequence)">...more</a> </div>',
/*         template: '<div><span style="font-weight: bold" ng-if="vm.marker">DNA, {{vm.marker}}: </span><span class="sequence" ng-bind-html="vm.html">{{vm.sequence}}</span><a class="text-right small shorten__more" ng-if="vm.shorten" href="" ng-click="vm.format(vm.sequence)">...more</a> <a ng-if="vm.searchable" class="gb-icon-search" ui-sref="occurrenceSearchTable(vm.query)" ></a></div>',
 */ scope: {},
        controller: sequenceCtrl,
        controllerAs: 'vm',
        bindToController: {
            data: '=',
            seq: '@',
            limit: '=',
            searchable: '='
        }
    };
    return directive;

    /** @ngInject */
    function sequenceCtrl() {
        var vm = this;
        vm.sequence = vm.data ? _.get(vm, 'data.extensions["http://rs.gbif.org/terms/1.0/DNADerivedData"][0]["http://rs.gbif.org/terms/dna_sequence"]') : vm.seq;
        vm.marker = _.get(vm, 'data.extensions["http://rs.gbif.org/terms/1.0/DNADerivedData"][0]["https://w3id.org/gensc/terms/MIXS:0000044"]');
        vm.html = ''; 
        vm.query = {dna_sequence: vm.sequence};
        vm.format = function(sequence, limit) {
            if (sequence) {
                var chars = sequence.split('');
                if (limit && limit < chars.length) {
                    chars = chars.slice(0, limit);
                    vm.shorten = true;
                } else {
                    vm.shorten = false;
                }
                var bases = {'a': true, 'c': true, 't': true, 'g': true};
    
                vm.html = chars.reduce(function(acc, cur) {
                    acc += bases[cur.toLowerCase()] ? '<span class="' + cur.toLowerCase() + '">' + cur.toUpperCase() + '</span>' : '<span>' + cur.toUpperCase() + '</span>';
                    return acc;
                }, '');
            }
        };

        vm.format(vm.sequence, parseInt(vm.limit));
    }
}

module.exports = sequenceDirective;

