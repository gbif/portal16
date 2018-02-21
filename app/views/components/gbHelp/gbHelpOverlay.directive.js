'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('gbHelpOverlay', gbHelpOverlayDirective);

/** @ngInject */
function gbHelpOverlayDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/gbHelp/gbHelpOverlay.html',
        scope: {
            gbHelp: '@',
            gbHelpOptions: '='
        },
        controller: gbHelpOverlayCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function gbHelpOverlayCtrl($scope, HelpService, $stateParams, $location, ResourceItem, $sce) {
        var vm = this;
        vm.state = HelpService.getState();

        vm.showPopup = function() {
            vm.show = true;
            vm.loading = false;
            vm.failed = false;
            vm.trustedBody = undefined;
            vm.helpItem = undefined;

            if (vm.isCms) {
                vm.loading = true;
                vm.helpItem = ResourceItem.query({
                    contentType: 'help',
                    identifier: vm.identifier,
                    locale: $stateParams.locale
                });
                vm.helpItem.$promise.then(function(resp) {
                    vm.loading = false;
                    vm.trustedBody = $sce.trustAsHtml(resp.body);
                }).catch(function() {
                    vm.failed = true;
                    vm.loading = false;
                });
            }
        };

        vm.close = function() {
            vm.show = false;
            HelpService.updateState(false);
        };

        $scope.$watchCollection(function() {
            return vm.state;
        }, function(newState, oldState) {
            vm.identifier = vm.state.identifier;
            vm.isCms = vm.state.isCms;
            vm.show = vm.state.open;
            if (vm.show) {
                vm.showPopup();
            } else {
                vm.close();
            }
        });
    }
}

module.exports = gbHelpOverlayDirective;
