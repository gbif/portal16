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
    function feedback($rootScope, User, $sessionStorage, $scope, $location, NAV_EVENTS, $http, IS_TOUCH) {
        var vm = this;
        vm.location = $location.path();
        vm.isActive = false;
        vm.contentFeedback = undefined;
        vm.issue = {};
        vm.issues = {};
        vm.ISSUES = 'issues';
        vm.CONFIRMATION = 'confirmation';
        vm.type = {
            // 0 left out to allow falsy test a la : if (vm.type) then ...
            CONTENT: 'data content',
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

        $scope.$on(NAV_EVENTS.toggleFeedback, function(event, data) {
            // open feedback on the relevant tab ((question, bug etc.))
            if (vm.type[data.type]) {
                vm.toggle(vm.type[data.type]);
            }
            // toggle or set state
            if (data.toggle) {
                vm.isActive = !vm.isActive;
            } else {
                vm.isActive = data.state;
            }
        });

        vm.close = function() {
            vm.isActive = false;
        };

        vm.toggle = function(type) {
            if (vm.selected == type) {
                vm.selected = undefined;
            } else {
                vm.selected = type;
            }
        };

        vm.createIssue = function(formData) {
            vm.state = 'SENDING';
            var issue = {
                width: window.innerWidth,
                height: window.innerHeight,
                type: vm.selected,
                form: formData,
                datasetKey: vm.associatedDatasetKey,
                publishingOrgKey: vm.associatedPublishingOrgKey
            };
            $http.post('/api/feedback/bug', issue, {}).then(function(response) {
                vm.referenceId = response.data.referenceId;
                vm.selected = vm.CONFIRMATION;
                vm.state = 'SUCCESS';
                vm.issue = {};
            }, function() {
                vm.state = 'FAILED';
            });
        };

        vm.gotoRoot = function() {
            vm.selected = undefined;
            vm.forceShowForm = false;
        };

        vm.updateContentFeedbackType = function() {
            $http.get('/api/feedback/content?path=' + encodeURIComponent($location.path()), {})
                .then(function(response) {
                    vm.contentFeedback = response.data;
                    vm.associatedDatasetKey = response.data.datasetKey;
                    vm.associatedPublishingOrgKey = response.data.publishingOrgKey;
                    vm.comments = vm.contentFeedback.comments;
                    if (_.get(vm, 'comments.count') > 0) {
                        vm.selected = vm.ISSUES;
                    }
                }, function() {
                    // TODO failed to get page type
                });
        };
        // Since feedback is route dependent, then update based on that. Currently only occurrenceKey is special
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name === 'occurrenceKey' || fromState.name === 'occurrenceKey') {
                vm.updateContentFeedbackType();
            }
        });
        vm.updateContentFeedbackType();

        vm.getUrl = function() {
            return window.location.href;
        };

        vm.hasUserToken = function() {
            return !!User.getAuthToken();
        };
    }
}

module.exports = feedbackDirective;

