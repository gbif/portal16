'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('enumFilter', enumFilterDirective);

/** @ngInject */
function enumFilterDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/enumFilter/enumFilter.html',
        scope: {
            values: '@',
            filter: '=',
            query: '='
        },
        replace: true,
        controller: enumFilter,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function enumFilter() {
        var vm = this;
        vm.filter = vm.filter ? [].concat(vm.filter) : [];
        vm.filterMap = {};
        vm.filter.forEach(function(e){
            vm.filterMap[e] = true;
        });
    }
}

module.exports = enumFilterDirective;
