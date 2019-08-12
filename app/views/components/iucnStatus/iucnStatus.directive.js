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

    var categoriesMap = {
        'LR/lc': 'LEAST_CONCERN', // Legacy
        'LR/cd': 'LEAST_CONCERN', // Legacy
        'LR/nt': 'NEAR_THREATENED', // Legacy
        'LC': 'LEAST_CONCERN',
        'NT': 'NEAR_THREATENED',
        'VU': 'VULNERABLE',
        'EN': 'ENDANGERED',
        'CR': 'CRITICALLY_ENDANGERED',
        'EW': 'EXTINCT_IN_THE_WILD',
        'EX': 'EXTINCT',
        'DD': 'DATA_DEFICIENT',
        'NE': 'NOT_EVALUATED'
    };

    return directive;

    /** @ngInject */
    function iucnStatusCtrl($http) {
        var vm = this;
        vm.loading = true;
        $http({
            method: 'get',
            url: '/api/wikidata/species/' + vm.key + '?locale=' + gb.locale
        }).then(function(res) {
            vm.loading = false;
            vm.iucnTaxonid = _.get(res, 'data.iucnIdentifier[0].id');
            if (_.get(res, 'data.iucnThreatStatus.abbrevation.value')) {
                vm.category = categoriesMap.hasOwnProperty(_.get(res, 'data.iucnThreatStatus.abbrevation.value')) ?
                categoriesMap[_.get(res, 'data.iucnThreatStatus.abbrevation.value')] : 'NOT_EVALUATED';
            } else {
                vm.category = 'NOT_EVALUATED';
            }
            vm.sourceLink = _.get(res, 'data.iucnIdentifier[0].url');
        }).catch(function(err) {
            vm.loading = false;
        });
    }
}

module.exports = iucnStatusDirective;

