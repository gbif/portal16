'use strict';

var angular = require('angular'),
    _ = require('lodash');

require('./notifications.service');

angular
    .module('portal')
    .directive('notifications', notificationsDirective);

/** @ngInject */
function notificationsDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/api/notifications/template.html?v=' + BUILD_VERSION,
        scope: {},
        replace: true,
        controller: notifications,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function notifications($scope, URL_PREFIX, NAV_EVENTS, NOTIFICATIONS, $sessionStorage, Notifications) { // include service to trigger the service
        var vm = this;
        vm.URL_PREFIX = URL_PREFIX;
        vm.isActive = false;

        $scope.$on(NAV_EVENTS.toggleNotifications, function(event, data) {
            if (data.toggle) {
                vm.isActive = !vm.isActive;
            } else {
                vm.isActive = data.state;
            }
        });

        vm.close = function() {
            vm.isActive = false;
        };

        function updateNotifications(notifications) {
            if (!_.isObject(notifications)) {
                return;
            }
            vm.notifications = notifications;
            if (notifications.severity == 'CRITICAL' && !$sessionStorage.hasSeenHealthAlert) {
                $sessionStorage.hasSeenHealthAlert = true;
                vm.isActive = true;
            }
            if (notifications.severity === 'OPERATIONAL') {
                vm.isActive = false;
            }
        }
        updateNotifications($sessionStorage.notifications);

        $scope.$on(NOTIFICATIONS.CHANGED, function(event, notifications) {
            updateNotifications(notifications);
        });
    }
}

module.exports = notificationsDirective;

