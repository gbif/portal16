'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('iucnStatus', iucnStatusDirective);

/** @ngInject */
function iucnStatusDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/components/iucnStatus/iucnStatus.html',
        scope: {
            key: '@'
        },
        controller: iucnStatusCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    var legacyCategories = {
        'LR/lc': 'LC',
        'LR/cd': 'LC',
        'LR/nt': 'NT'
    };

    return directive;

    /** @ngInject */
    function iucnStatusCtrl($http) {
        var vm = this;
        vm.insufficientCategories = ['NE', 'DD'];
        vm.mainCategories = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX'];
        vm.loading = true;
        $http({
            method: 'get',
            url: '/api/wikidata/species/' + vm.key + '?locale=' + gb.locale
        }).then(function(res) {
            vm.loading = false;
            vm.iucnTaxonid = _.get(res, 'data.iucnIdentifier[0].id');
            if (_.get(res, 'data.iucnThreatStatus.abbrevation.value')) {
                vm.category = legacyCategories.hasOwnProperty(_.get(res, 'data.iucnThreatStatus.abbrevation.value')) ?
                legacyCategories[_.get(res, 'data.iucnThreatStatus.abbrevation.value')] : _.get(res, 'data.iucnThreatStatus.abbrevation.value');
            } else {
                vm.category = 'NE';
            }
            vm.sourceLink = _.get(res, 'data.iucnIdentifier[0].url');
        }).catch(function(err) {
            vm.loading = false;
        });
    }
}

module.exports = iucnStatusDirective;

