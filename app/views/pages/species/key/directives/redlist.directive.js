'use strict';

let angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('redlist', redlistDirective);

/** @ngInject */
function redlistDirective() {
    let directive = {
        restrict: 'E',
        template: '<a href="{{vm.link}}" class="badge redlist-category-{{vm.category}}">{{vm.categoryTitle}}</a>',
        scope: {},
        controller: redlistCtrl,
        controllerAs: 'vm',
        bindToController: {
            name: '@',
        },
    };
    let categories = {
        'EX': 'Extinct',
        'EW': 'Extinct in the Wild',
        'CR': 'Critically Endangered',
        'EN': 'Endangered',
        'VU': 'Vulnerable',
        'NT': 'Near Threatened',
        'LC': 'Least Concern',
        'DD': 'Data Deficient',
        'NE': 'Not Evaluated',
    };
    let legacyCategories = {
        'LR/lc': 'LC',
        'LR/cd': 'LC',
        'LR/nt': 'NT',
    };

    return directive;

    /** @ngInject */
    function redlistCtrl(RedlistSpecies) {
        let vm = this;
        vm.categoryTitle;
        vm.category;
        vm.link;

        RedlistSpecies.query({
            name: vm.name,

        }, function(data) {
            let iucn = _.head(data.result);
            if (iucn) {
                if (legacyCategories.hasOwnProperty(iucn.category)) {
                    iucn.category = legacyCategories[iucn.category];
                }
                vm.category = iucn.category;
                vm.link = 'http://apiv3.iucnredlist.org/api/v3/website/' + vm.name;
            } else {
                vm.category = 'NE';
                vm.link = '#';
            }
            vm.categoryTitle = categories[vm.category];
        }, function() {
        });
    }
}

module.exports = redlistDirective;

