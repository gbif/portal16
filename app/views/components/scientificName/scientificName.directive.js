'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('scientificName', scientificNameDirective);

/** @ngInject */
function scientificNameDirective() {
    var directive = {
        restrict: 'A',
        template: '<span ng-bind-html="vm.parsedName"></span>',
        scope: {},
        controller: scientificNameCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@',
            name: '@'
        }
    };

    return directive;

    /** @ngInject */
    function scientificNameCtrl(SpeciesParsedName) {
        var vm = this;
        vm.parsedName = vm.name;
        SpeciesParsedName.get({id:vm.key}, function(data){
            vm.parsedName = data.n;
        }, function(err){
            console.log(err);
        });
    }
}

module.exports = scientificNameDirective;

