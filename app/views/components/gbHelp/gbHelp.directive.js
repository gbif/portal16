'use strict';

var angular = require('angular'),
    _ = require('lodash');

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
            gbHelpOptions: '='
        },
        controller: gbHelpCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function gbHelpCtrl($stateParams, ResourceItem, $sce) {
        var vm = this;
        vm.helpIdentifier = vm.gbHelp;
        vm.hideIcon = _.get(vm.gbHelpOptions, 'hideIcon');
        vm.showPopup = function(){
            vm.show = true;
            vm.translationKey = _.get(vm.gbHelpOptions, 'translationKey');
            if (!vm.translationKey) {
                vm.loading = true;
                vm.failed = false;
                vm.helpItem = ResourceItem.query({
                    contentType: 'help',
                    identifier: vm.helpIdentifier,
                    locale: $stateParams.locale
                });
                vm.helpItem.$promise.then(function (resp) {
                    vm.loading = false;
                    vm.trustedBody = $sce.trustAsHtml(resp.body);
                }).catch(function () {
                    vm.failed = true;
                    vm.loading = false;
                });
            }
        }
    }
}

module.exports = gbHelpDirective;


//<div gb-help="time-to-index-dataset" gb-help-options="{hideIcon: false}">Show icon</div>
//<div gb-help="time-to-index-dataset" gb-help-options="{hideIcon: true}">Hide icon</div>
//<span gb-help="testthis" gb-help-options="{translationKey: 'help.isSplashScreen'}">Take popup from translation key</span>