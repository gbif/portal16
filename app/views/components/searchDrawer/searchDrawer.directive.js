'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('searchDrawer', searchDrawerDirective);

/** @ngInject */
function searchDrawerDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/searchDrawer/searchDrawer.html',
        scope: {
            filter: '=',
            contentType: '@'
        },
        replace: true,
        controller: searchDrawer,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function searchDrawer($state, OccurrenceFilter) {
        var vm = this;
        vm.filter = vm.filter || {};

        vm.getFilterCount = function() {
            var c = 0;
            Object.keys(vm.filter).forEach(function(e){
                var v = vm.filter[e];
                if (typeof v !== 'undefined' && v!= '' && e != 'locale' && e != 'offset' && e != 'limit' && e != 'center' && e != 'zoom') {
                    c += [].concat(v).length;
                }
            });
            return c;
        };

        vm.search = function() {
            //$state.go('.', vm.filter, {inherit:false, notify: false, reload: false});
            OccurrenceFilter.filterChange({'hej': 5});
        };

        //vm.fabStyle = {
        //    top: '300px'
        //};
        //vm.repositionFloatAction = function($event) {
        //    vm.fabStyle.top = $event.pageY + 'px';
        //    console.log($event.clientY);
        //};

    }
}

module.exports = searchDrawerDirective;
