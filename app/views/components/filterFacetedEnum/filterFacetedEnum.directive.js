'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('filterFacetedEnum', filterFacetedEnumDirective);

/** @ngInject */
function filterFacetedEnumDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/filterFacetedEnum/filterFacetedEnum.html',
        scope: {
            filterState: '=',
            filterConfig: '='
        },
        replace: true,
        controller: filterFacetedEnum,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function filterFacetedEnum($scope, $filter) {
        var vm = this;
        vm.disabled = false;

        // expect to be defined
        //
        // multiselect
        // vm.filterConfig.queryKey
        // vm.filterConfig.title
        // vm.filterConfig.type //either raw, enum or keyed.
        //
        // if raw then just show then raw value of the url (recoded by eg)
        // if enum, then expect translation prefix and enum list. (basisOfRecord eg)
        // if keyed, then expect endpoint to resolve title
        // if searchable then expect endpoint with suggestions. for complex suggestions another directive perhaps (say scientific name that needs special templating)?
        // if enum then have option to show ordered and option to show all.
        //
        // too many options for one directive? split into several? subcomponents? eg.suggestions and inputs and titleResolver?

        vm.query = $filter('unique')(vm.filterState.query[vm.filterConfig.queryKey]);

        vm.selected = {};
        function setSelectedModel(query) {
            query.forEach(function (e) {
                vm.selected[e] = true;
            });
        }
        setSelectedModel(vm.query);

        //vm.queryKey = vm.filterConfig.queryKey || vm.filterConfig.title;
        //vm.translationPrefix = vm.filterConfig.translationPrefix || 'stdTerms';
        //vm.collapsed = vm.filterConfig.collapsed !== false;
        //vm.facetKey = vm.filterConfig.facetKey;

        //vm.checkboxModel = {};
        //
        //vm.options = {};
        //
        //function setModel(query) {
        //    query.forEach(function (e) {
        //        vm.checkboxModel[e] = true;
        //    });
        //}
        //
        //setModel(vm.query);
        //
        //vm.showFacetCount = function () {
        //    return vm.facetKey && !vm.collapsed && Object.keys(vm.options).length > 1;
        //};
        //
        //vm.apply = function () {
        //    if (vm.filterAutoUpdate && !vm.disabled) {
        //        vm.query = [];
        //        Object.keys(vm.checkboxModel).forEach(function (key) {
        //            if (vm.checkboxModel[key]) {
        //                vm.query.push(key);
        //            }
        //        });
        //        vm.filterConfig.filter.updateParam(vm.queryKey, vm.query);
        //    }
        //};
        //
        //$scope.$watch(function () {
        //    return vm.filterState.query[vm.queryKey]
        //}, function (newQuery) {
        //    vm.query = $filter('unique')(newQuery);
        //    setModel(vm.query);
        //});
        //
        //vm.updateOptions = function (apiResponse) {
        //    vm.options = _.get(apiResponse, 'facets[' + vm.facetKey + '].counts', []);
        //    vm.options = vm.options.filter(function(e){
        //        return vm.query.indexOf(e.name) != -1;
        //    });
        //};
        //
        //$scope.$watch(function () {
        //    if (vm.filterConfig.multiSelect && typeof vm.filterState.query[vm.filterConfig.queryKey] !== 'undefined') {
        //        return vm.filterState.facetMultiselect;
        //    }
        //    return vm.filterState.data
        //}, function (newData) {
        //    vm.disabled = true;
        //    newData.$promise.then(function (data) {
        //        vm.updateOptions(data);
        //        vm.disabled = false;
        //    }, function () {
        //        vm.disabled = false;
        //    });
        //});
        //
        //vm.filterState.data.$promise.then(function (data) {
        //    vm.updateOptions(data);
        //});

    }
}

module.exports = filterFacetedEnumDirective;
