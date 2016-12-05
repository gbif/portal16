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
    vm.isActive = true;
    vm.issue = {};
    vm.type = {
        //0 left out to allow falsy test a la : if (vm.type) then ...
        CONTENT: 'content',
        FUNCTIONALITY: 'bug',
        IDEA: 'idea',
        QUESTION: 'question'
    };
    vm.selected = vm.type.IDEA;

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
        var issue = {
                width: window.innerWidth,
                height: window.innerHeight,
                type: vm.selected,
                form: formData
            };
        $http.post('/api/feedback/bug', issue, {}).then(function (response) {
            vm.referenceId = response.data.referenceId;
            vm.state = 'SUCCESS';
        }, function () {
            vm.state = 'FAILED';
        });
    };

}

module.exports = feedbackCtrl;