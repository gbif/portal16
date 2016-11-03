'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('cites', citesDirective);

/** @ngInject */
function citesDirective() {
    var directive = {
        restrict: 'E',
        template: '<a href="https://speciesplus.net/#/taxon_concepts/{{vm.id}}/legal" class="badge cites">{{vm.appendix}}</a>',
        scope: {},
        controller: citesCtrl,
        controllerAs: 'vm',
        bindToController: {
            name: '@'
        }
    };
    return directive;

    /** @ngInject */
    function citesCtrl(CitesApi) {
        var vm = this;
        vm.appendix;
        vm.id;
        vm.listings=[];

        CitesApi.query({
            name: vm.name

        }, function (data) {
            var tax = _.head(data.taxon_concepts);
            if (tax) {
                vm.appendix = "Appendix " + tax.cites_listing;
                vm.listings = tax.cites_listings;
                vm.id = tax.id;
            }
        }, function () {

        });
    }
}

module.exports = citesDirective;

