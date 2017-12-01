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
        .service('Notifications', function ($http, $timeout, $rootScope, NOTIFICATIONS, HEALTH, $sessionStorage) {

                function update() {
                    $http.get('/api/health/portal?hash=' + _.get($sessionStorage.notifications, 'hash', '_empty'))
                        .then(function (response) {
                            if (response.status == 200) {
                                var notifications = response.data;
                                if (_.get($sessionStorage.notifications, 'hash') != notifications.hash) {
                                    $sessionStorage.notifications = notifications;
                                    $rootScope.$broadcast(NOTIFICATIONS.CHANGED, notifications);
                                }
                            } else {
                                var notifications = $sessionStorage.notifications;
                                notifications.updatedAt = (new Date()).toISOString();
                                $sessionStorage.notifications = notifications;
                                //don't broadcast for timestamp updates
                                //$rootScope.$broadcast(NOTIFICATIONS.CHANGED, notifications);
                            }
                        })
                        .catch(function () {
                            //ignore failure - we will retry shortly anyhow
                        }).
                        finally(function(){
                            $timeout(update, 10000);
                        });
                }
                update();
            }
        );
})();

