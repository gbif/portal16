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
            threatStatus: '=',
            name: '@'
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
    function iucnStatusCtrl($scope, RedlistSpecies, endpoints) {
        var vm = this;
        vm.iucnUserLink = endpoints.iucnUserLink;
        vm.insufficientCategories = ["NE", "DD"];
        vm.mainCategories = ["LC", "NT", "VU", "EN", "CR", "EW", "EX"];

        $scope.$watch(function () {
            return vm.name;
        }, function () {
            getRedListData(vm.name)
        });

        function getRedListData(name){
            if (!name){
                return;
            }
            vm.loading = true;
            vm.category = 'blank';
            vm.redlistResult = RedlistSpecies.query({
                name: name

            }, function (data) {
                var iucn = _.head(data.result);
                if (iucn) {
                    if (legacyCategories.hasOwnProperty(iucn.category)) {
                        iucn.category = legacyCategories[iucn.category];
                    }
                    vm.category = iucn.category;
                    vm.iucnTaxonid = iucn.taxonid;
                } else {
                    vm.category = undefined;
                }
                vm.threatStatus = vm.category;
                vm.loading = false;
            }, function () {
                vm.loading = false;
                vm.failed = true;
            });
        }
        getRedListData(vm.name);
    }
}

module.exports = iucnStatusDirective;

