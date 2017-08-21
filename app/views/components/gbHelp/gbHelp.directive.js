'use strict';

var angular = require('angular'),
    _ = require('lodash');
console.log('loaded');
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
            gbHelp: '@'
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
        console.log('sdf');
        console.log(vm.helpIdentifier);
        console.log($stateParams.locale);
        vm.showPopup = function(){
            vm.show = true;
            vm.helpHtml = ResourceItem.query({contentType: 'article', id: '1K2rq58saEEAAkqMM8SuyY', html: true});
        }
    }
}

module.exports = gbHelpDirective;

