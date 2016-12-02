'use strict';
//feedback could be structured into several types
// content/data feedback, web site feedback, questions, system status

var angular = require('angular');

angular
    .module('portal')
    .controller('feedbackCtrl', feedbackCtrl);

/** @ngInject */
function feedbackCtrl($scope, NAV_EVENTS, $http) {
    var vm = this;
    vm.isActive = false;
    vm.issue = {};
    vm.type = {
        //0 left out to allow falsy test a la : if (vm.type) then ...
        CONTENT: 1,
        FUNCTIONALITY: 2,
        QUESTION: 3
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
        vm.selected = undefined;
    };

    vm.toggle = function(type) {
        if (vm.selected == type) {
            vm.selected = undefined;
        } else {
            vm.selected = type;
        }
    };

    vm.createIssue = function (formData) {
        var w = window.innerWidth;
        var h = window.innerHeight;
        $http.post('/api/feedback/bug', {form: formData, width: w, height: h, type: 'Bug'}, {}).then(function (response) {
            vm.referenceId = response.data.referenceId;
            vm.state = 'SUCCESS';
        }, function () {
            vm.state = 'FAILED';
        });
    };

}

module.exports = feedbackCtrl;