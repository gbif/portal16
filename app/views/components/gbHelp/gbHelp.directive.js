'use strict';

let angular = require('angular'),
    _ = require('lodash');

require('./gbHelpOverlay.directive');
require('./gbHelp.service');

angular
    .module('portal')
    .directive('gbHelp', gbHelpDirective);

/** @ngInject */
function gbHelpDirective(BUILD_VERSION) {
    let directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/templates/components/gbHelp/gbHelp.html?v=' + BUILD_VERSION,
        scope: {
            gbHelp: '@',
            gbHelpOptions: '=',
        },
        controller: gbHelpCtrl,
        controllerAs: 'vm',
        bindToController: true,
    };

    return directive;

    /** @ngInject */
    function gbHelpCtrl(HelpService) {
        let vm = this;

        vm.helpIdentifier = vm.gbHelp || _.get(vm.gbHelpOptions, 'identifier');
        vm.hideIcon = _.get(vm.gbHelpOptions, 'hideIcon');
        vm.forceShow = _.get(vm.gbHelpOptions, 'forceShow');
        vm.onClose = _.get(vm.gbHelpOptions, 'onClose');

        vm.showPopup = function() {
            HelpService.updateState(true, vm.helpIdentifier, _.get(vm.gbHelpOptions, 'isCms'));
        };

        if (vm.forceShow) {
            vm.showPopup();
        }
    }
}

module.exports = gbHelpDirective;

// <div gb-help="testthis">plain in div</div>
// <div>Part of a <span gb-help="testthis" style="color: tomato">sentence</span></div>
// <div gb-help gb-help-options="{identifier: 'testthis', hideIcon: true}">without icon</div>
// <div gb-help="help.locationFilterWarning" gb-help-options="{isCms: false}">Popup text from translation file</div>
