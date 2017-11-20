(function () {
    'use strict';
    var angular = require('angular'),
        _ = require('lodash');

    angular
        .module('portal')
        .constant('NOTIFICATIONS', {
            CHANGED: 'NOTIFICATIONS_CHANGED'
        })
        .constant('HEALTH', {
            CHANGED: 'HEALTH_CHANGED'
        });

    angular
        .module('portal')
        .service('Notifications', function ($http, $rootScope, NOTIFICATIONS, HEALTH, $sessionStorage, $interval, socket) {
                socket.on('statusNotification', function (data) {
                    if (_.get($sessionStorage.health, 'hash') != data.hash) {
                        //if health changed and to the worse, then broadcast
                        if (data.severity == 'CRITICAL' && !$sessionStorage.hasSeenHealthAlert) {
                            $sessionStorage.hasSeenHealthAlert = true;
                            data._alert = true;
                        }
                    }
                    $rootScope.$broadcast(HEALTH.CHANGED, data);
                    $rootScope.$broadcast(NOTIFICATIONS.CHANGED, getHealthNotifications(data));
                    $sessionStorage.health = data;
                });

                function getHealthNotifications(health) {
                    var notifications = [].concat(_.get(health, 'messages.list', []));
                    if (_.get(health, 'health.severity') !== 'OPERATIONAL') {
                        notifications.push({
                            title: 'We are having endpoint issues',
                            summary: 'Not all our services is working as expected and the website is likely to behave erradict as a result',
                            severity: _.get(health, 'health.severity'),
                            url: '/health'
                        });
                    }
                    return {
                        count: notifications.length,
                        results: notifications,
                        alert: health._alert || false,
                        severity: health.severity
                    };
                }
            }
        );
})();

