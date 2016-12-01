'use strict';
//feedback could be structured into several types
// content/data feedback, web site feedback, questions, system status

var angular = require('angular');

angular
    .module('portal')
    .controller('feedbackCtrl', feedbackCtrl);

/** @ngInject */
function feedbackCtrl($scope, NAV_EVENTS) {
    var vm = this;
    vm.isActive = false;

    $scope.$on(NAV_EVENTS.toggleFeedback, function (event, data) {
        if (data.toggle) {
            vm.isActive = !vm.isActive;
        } else {
            vm.isActive = data.state;
        }
    });
}

module.exports = feedbackCtrl;