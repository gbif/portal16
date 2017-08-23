'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('gbHelp', gbHelpDirective);

/** @ngInject */
function gbHelpDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/gbHelp/gbHelp.html',
        scope: {
            gbHelp: '@',
            gbHelpOptions: '@'
        },
        controller: gbHelpCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function gbHelpCtrl($stateParams, ResourceItem) {
        var vm = this;
        vm.helpIdentifier = vm.gbHelp;
        vm.showPopup = function(){
            vm.show = true;
            vm.loading = true;
            //console.log(gbHelpOptions);
            //console.log(gbHelpOptions.translationKey);

            vm.helpItem = ResourceItem.query({contentType: 'help', identifier: vm.helpIdentifier, locale: $stateParams.locale});
            vm.helpItem.$promise.then(function(){
                vm.loading = false;
            });
        }
    }
}

module.exports = gbHelpDirective;

