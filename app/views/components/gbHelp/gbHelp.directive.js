'use strict';

var angular = require('angular'),
    _ = require('lodash');

require('./gbHelpOverlay.directive');
require('./gbHelp.service');

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
    function gbHelpCtrl(HelpService) {
        var vm = this;

        vm.helpIdentifier = vm.gbHelp || _.get(vm.gbHelpOptions, 'identifier');
        vm.hideIcon = _.get(vm.gbHelpOptions, 'hideIcon');
        vm.forceShow = _.get(vm.gbHelpOptions, 'forceShow');
        vm.onClose = _.get(vm.gbHelpOptions, 'onClose');

        vm.showPopup = function(){
            HelpService.updateState(true, vm.helpIdentifier);
        };

        if (vm.forceShow) {
            vm.showPopup();
        }
    }
}

module.exports = gbHelpDirective;


//<div gb-help="time-to-index-dataset" gb-help-options="{hideIcon: false}">Show icon</div>
//<div gb-help="time-to-index-dataset" gb-help-options="{hideIcon: true}">Hide icon</div>
//<span gb-help="testthis" gb-help-options="{translationKey: 'help.isSplashScreen'}">Take popup from translation key</span>