'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('suggest', suggestDirective);

/** @ngInject */
function suggestDirective() {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/suggest/suggest.html',
        scope: {
            suggest: '=',
            config: '='
        },
        controller: suggest,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function suggest($scope) {
        var vm = this;
        var timer;
        vm.suggest.selected = vm.suggest.selected || [];
        vm.suggest.selectedKeys = vm.suggest.selectedKeys || [];
        vm.currentQuery = '';

        vm.suggest.add = function(index) {
            vm.setActive(index);
            if (vm.suggest.selectedKeys.indexOf(vm.suggest.active[vm.config.key]) < 0) {
                vm.suggest.selected.push(vm.suggest.active);
                vm.suggest.selectedKeys.push(vm.suggest.active[vm.config.key]);
                if (vm.config.onChange) vm.config.onChange(vm.suggest.selected);
            } else {
                console.log('already in list');
            }
        };

        vm.suggest.remove = function(i) {
            if (i < 0 || i > vm.suggest.selected.length) return;

            vm.suggest.selected.splice(i, 1);
            if (vm.config.onChange) vm.config.onChange(vm.suggest.selected);
        };

        vm.search = function(event, query) {

            if (event.keyCode == 40 || event.keyCode == 38) return;//UP DOWN ARROWS
            if (event.keyCode == 13) {//ENTER
                //fire confirmEvent
                vm.suggest.add(vm.suggest.activeIndex);
                return;
            }
            if (event.keyCode == 27) {//ESC
                //fire cancelEvent
                if (vm.config.onCancel) vm.config.onCancel();
                return;
            }
            if (timer) window.clearTimeout(timer);
            timer = setTimeout(function(){
                vm.getSuggestions(query);
            }, 300);


        };

        vm.getSuggestions = function(query) {
            if (vm.currentQuery == query) return;
            var queryParams = vm.config.baseQuery;
            queryParams[vm.config.queryField] = query;
            vm.currentQuery = query;
            vm.suggest.activeIndex = undefined;
            vm.suggest.active = undefined;
            vm.config.resource.query(queryParams, function(data) {
                vm.suggest.suggestions = data;
                var firstSuggestion = vm.suggest.suggestions;
                if (firstSuggestion && firstSuggestion[0] && vm.config.matchField && firstSuggestion[0][vm.config.matchField].toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) > -1) {
                    vm.suggest.activeIndex = 0;
                } else {
                    vm.suggest.activeIndex = undefined;
                }
            });
        };

        vm.setActive = function(index) {
            if (index !== parseInt(index, 10) || !vm.suggest.suggestions) {
                vm.suggest.active = vm.suggest.activeIndex = undefined;
                return;
            }
            if (index < 0) {
                index = vm.suggest.suggestions.length-1;
            } else if (index >= vm.suggest.suggestions.length) {
                index = index % vm.suggest.suggestions.length;
            }
            vm.suggest.activeIndex = index;
            vm.suggest.active = vm.suggest.suggestions[index];
            vm.query = vm.suggest.active.canonicalName;
        };

        vm.browse = function(event) {
            if (timer) window.clearTimeout(timer);
            if (event.keyCode == 40) {//DOWN ARROW
                //if (vm.suggest.activeIndex !== parseInt(vm.suggest.activeIndex, 10)) vm.suggest.activeIndex = 0;
                vm.suggest.activeIndex = vm.suggest.activeIndex+1 || 0;
                vm.setActive(vm.suggest.activeIndex);
                event.preventDefault();
            }
            if (event.keyCode == 38) {//UP ARROW
                //if (vm.suggest.activeIndex !== parseInt(vm.suggest.activeIndex, 10)) vm.suggest.activeIndex = 0;
                //vm.suggest.activeIndex--;
                vm.suggest.activeIndex = vm.suggest.activeIndex-1 || 0;
                vm.setActive(vm.suggest.activeIndex);
                event.preventDefault();
            }
        };

        //$scope.$watch('vm.suggest.activeIndex', function() {
        //});
    }
}

module.exports = suggestDirective;
