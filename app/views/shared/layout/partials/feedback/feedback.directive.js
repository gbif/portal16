'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('feedback', feedbackDirective);

/** @ngInject */
function feedbackDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/api/feedback/template.html?v=' + BUILD_VERSION,
        scope: {},
        replace: true,
        controller: feedback,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function feedback(User, $sessionStorage, $scope, $location, NAV_EVENTS, $http, IS_TOUCH) {
        var vm = this;
        vm.location = $location.path();
        vm.isActive = false;
        vm.contentFeedback = undefined;
        vm.issue = {};
        vm.issues = {};
        vm.ISSUES = 'issues';
        vm.CONFIRMATION = 'confirmation';
        vm.type = {
            //0 left out to allow falsy test a la : if (vm.type) then ...
            CONTENT: 'content',
            FUNCTIONALITY: 'bug',
            IDEA: 'idea',
            QUESTION: 'question'
        };
        vm.selected = undefined;

        vm.clickedOutside = function() {
            if (!IS_TOUCH) {
                vm.isActive = false;
            }
        };

        function updateUser() {
            vm.userContactInfo = _.get($sessionStorage.user, 'githubUserName');
            vm.issue.contact = vm.issue.contact || vm.userContactInfo;
        }
        updateUser();

        $scope.$on(NAV_EVENTS.toggleFeedback, function (event, data) {
            //open feedback on the relevant tab ((question, bug etc.))
            if (vm.type[data.type]) {
                vm.toggle(vm.type[data.type]);
            }
            //toggle or set state
            if (data.toggle) {
                vm.isActive = !vm.isActive;
            } else {
                vm.isActive = data.state;
            }
        });

        vm.close = function () {
            vm.isActive = false;
        };

        vm.toggle = function (type) {
            if (vm.selected == type) {
                vm.selected = undefined;
            } else {
                vm.selected = type;
            }
        };

        vm.createIssue = function (formData) {
            vm.state = 'SENDING';
            var issue = {
                width: window.innerWidth,
                height: window.innerHeight,
                type: vm.selected,
                form: formData,
                datasetKey: vm.associatedDatasetKey,
                publishingOrgKey: vm.associatedPublishingOrgKey
            };
            $http.post('/api/feedback/bug', issue, {}).then(function (response) {
                vm.referenceId = response.data.referenceId;
                vm.selected = vm.CONFIRMATION;
                vm.state = 'SUCCESS';
                vm.issue = {};
            }, function () {
                vm.state = 'FAILED';
            });
        };

        vm.gotoRoot = function () {
            vm.selected = undefined;
            vm.forceShowForm = false;
        };

        vm.updateContentFeedbackType = function () {
            $http.get('/api/feedback/content?path=' + encodeURIComponent($location.path()), {})
                .then(function (response) {
                    vm.contentFeedback = response.data;
                    vm.associatedDatasetKey = response.data.datasetKey;
                    vm.associatedPublishingOrgKey = response.data.publishingOrgKey;
                }, function () {
                    //TODO failed to get page type
                });
        };
        vm.updateContentFeedbackType();

        //We get API rate limit errors from Github - so this has been disabled for now. The idea was that issues reported in github would show on the page they were reported on
        //vm.getIssues = function () {
        //    $http.get('/api/feedback/issues?item=' + encodeURIComponent($location.path()), {})
        //        .then(function (response) {
        //            vm.issues = response.data;
        //            if (vm.issues.total_count) {
        //                vm.selected = vm.ISSUES;
        //            }
        //        }, function () { // (err)
        //            vm.issues = {};
        //            //TODO mark as failure or simply hide
        //        });
        //};
        //vm.getIssues();

        vm.getUrl = function() {
            return window.location.href;
        }

    }
}

module.exports = feedbackDirective;

