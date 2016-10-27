'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('redlist', redlistDirective);

/** @ngInject */
function redlistDirective() {
    var directive = {
        restrict: 'E',
        template: '<a href="http://apiv3.iucnredlist.org/api/v3/website/{{vm.name}}" class="badge redlist-category-{{vm.category}}">{{vm.categoryTitle}}</a>',
        scope: {},
        controller: redlistCtrl,
        controllerAs: 'vm',
        bindToController: {
            name: '@'
        }
    };
    var categories = {
        'EX': 'Extinct',
        'EW': 'Extinct in the Wild',
        'CR': 'Critically Endangered',
        'EN': 'Endangered',
        'VU': 'Vulnerable',
        'NT': 'Near Threatened',
        'LC': 'Least Concern',
        'DD': 'Data Deficient',
        'NE': 'Not Evaluated'
    };
    return directive;

    /** @ngInject */
    function redlistCtrl(RedlistSpecies) {
        var vm = this;
        vm.categoryTitle = '';
        vm.category = '';

        RedlistSpecies.query({
            name: vm.name

        }, function (data) {
            var iucn = _.head(data.result);
            if (iucn) {
                vm.category = iucn.category;
                vm.categoryTitle = categories[iucn.category];
            }
        }, function () {

        });
    }
}

module.exports = redlistDirective;

