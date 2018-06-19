'use strict';

var angular = require('angular');

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
            query.forEach(function(e) {
                vm.selected[e] = true;
            });
        }
        setSelectedModel(vm.query);
    }
}

module.exports = filterFacetedEnumDirective;
