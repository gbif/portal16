(function () {
    'use strict';
    var angular = require('angular'),
        _ = require('lodash');

    angular
        .module('portal')
        .constant('NOTIFICATIONS', {
            CHANGED: 'CHANGED'
        });

    angular
        .module('portal')
        .service('Notifications', function ($http, $rootScope, NOTIFICATIONS, $sessionStorage, $interval) {
            var typeMap = {BLOCKER: 3, WARNING: 2, INFO: 1};
            var classMap = {
                3: 'isBlocker',
                2: 'isWarning',
                1: 'isInfo'
            };

            function decorate(notifications) {
                notifications.results.forEach(function(e){
                    e._severity = typeMap[e.type];
                });
                notifications.results = _.sortBy(notifications.results, '_severity').reverse();
                var mostSevere = _.get(_.maxBy(notifications.results, '_severity'), '_severity', 0);
                notifications.severity = {
                    value: mostSevere,
                    className: classMap[mostSevere]
                };
                return notifications;
            }

            function updateNotifications() {
                $http.get('/api/notifications', {})
                    .then(function (response) {
                        var notifications = decorate(response.data);
                        if (notifications.severity.value == 3 && !$sessionStorage.gb_hasBeenNotified) {
                            notifications.alert = true;
                            $sessionStorage.gb_hasBeenNotified = true;
                        }
                        $rootScope.$broadcast(NOTIFICATIONS.CHANGED, notifications);
                    }, function () {
                        //TODO mark as failure or simply hide
                    });
            }
            updateNotifications();
            $interval(updateNotifications, 120000);
        }
    );
})();

