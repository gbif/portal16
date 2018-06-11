(function() {
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
        .service('Notifications', function(User, USER_ROLES, $window, $http, $timeout, $rootScope, NOTIFICATIONS, HEALTH, $sessionStorage) {
                function update() {
                    var url;
                    if (_.get($sessionStorage.notifications, 'locale') !== gb.locale) {
                        url = '/api/health/portal?hash=' + '_empty' + '&locale=' + gb.locale;
                    } else {
                        url = '/api/health/portal?hash=' + _.get($sessionStorage.notifications, 'hash', '_empty') + '&locale=' + gb.locale;
                    }
                    $http.get(url)
                        .then(function(response) {
                            var notifications;
                            if (response.status == 200) {
                                notifications = response.data;
                                if (_.get($sessionStorage.notifications, 'hash') != notifications.hash) {
                                    $sessionStorage.notifications = _.extend({}, notifications, {locale: gb.locale});
                                    $rootScope.$broadcast(NOTIFICATIONS.CHANGED, notifications);
                                    pushNotification(notifications);
                                } else if (_.get($sessionStorage.notifications, 'locale') !== gb.locale) {
                                    $sessionStorage.notifications = _.extend({}, notifications, {locale: gb.locale});
                                    $rootScope.$broadcast(NOTIFICATIONS.CHANGED, notifications);
                                }
                            } else {
                                notifications = $sessionStorage.notifications;
                                notifications.updatedAt = (new Date()).toISOString();
                                $sessionStorage.notifications = notifications;
                                // don't broadcast for timestamp updates
                                // $rootScope.$broadcast(NOTIFICATIONS.CHANGED, notifications);
                            }
                        })
                        .catch(function() {
                            // ignore failure - we will retry shortly anyhow
                        }).finally(function() {
                        // a silly wrapper to avoid a constantly waiting $timeout object that protractor tests will wait for
                        window.setTimeout(update, 10000);
                    });
                }

                update();

                function spawnNotification(body, title) {
                    var options = {
                        body: body,
                        icon: 'http://www.gbif.org/img/logo/GBIF-2015-mark.png'
                    };
                    var notification = new Notification(title, options);
                    notification.onclick = function() {
                        window.open($window.location.origin + '/health');
                    };
                }

                // send push notifications about stability to registry admins that have set there browsers to recieve push notifications
                function pushNotification(notifications) {
                    if ('Notification' in window) {
                        var isRegistryAdmin = User.hasRole(USER_ROLES.REGISTRY_ADMIN);
                        if (Notification.permission == 'granted' && isRegistryAdmin && notifications.severity !== 'OPERATIONAL') {
                            spawnNotification(notifications.severity, 'GBIF system health');
                        }
                    }
                }
            }
        );
})();

