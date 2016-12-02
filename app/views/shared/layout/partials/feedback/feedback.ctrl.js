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
    vm.type = {
        //0 left out to allow falsy test a la : if (vm.type) then ...
        CONTENT: 1,
        BUG: 2,
        IDEA: 3,
        QUESTION: 4
    };
    vm.selected = undefined;

    $scope.$on(NAV_EVENTS.toggleFeedback, function (event, data) {
        if (data.toggle) {
            vm.isActive = !vm.isActive;
        } else {
            vm.isActive = data.state;
        }
    });

    vm.close = function() {
        vm.isActive = false;
    }

    vm.toggle = function(type) {
        if (vm.selected == type) {
            vm.selected = undefined;
        } else {
            vm.selected = type;
        }
    }
}

module.exports = feedbackCtrl;