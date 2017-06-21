(function () {
    'use strict';
    var angular = require('angular');

    angular
        .module('portal')
        .constant('NOTIFICATIONS', {
            CHANGED: 'CHANGED'
        });

    angular
        .module('portal')
        .service('Notifications', function ($http, $rootScope, NOTIFICATIONS, $cookies) {
            var that = this;

            var typeMap = {BLOCKER: 3, WARNING: 2, INFO: 1};
            var classMap = {
                3: 'isBlocker',
                2: 'isWarning',
                1: 'isInfo'
            };

            var state = {
                data: {
                    notifications: {},
                    severity: undefined
                }
            };

            function getState() {
                return state;
            }

            function decorate(notifications) {
                notifications.results.forEach(function(e){
                    e._severity = typeMap[e.type];
                });
                notifications.results = _.sortBy(notifications.results, '_severity');
                state.notifications = notifications;
                var mostSevere = _.get(_.maxBy(notifications.results, '_severity'), '_severity', 0);
                state.severity = {
                    value: mostSevere,
                    className: classMap[mostSevere]
                };
            }

            that.updateNotifications = function () {

                $http.get('/api/notifications', {})
                    .then(function (response) {
                        decorate(response.data);
                        $rootScope.$broadcast(NOTIFICATIONS.CHANGED);
                    }, function () {
                        //TODO mark as failure or simply hide
                    });
            };
            that.updateNotifications();

            return {
                getState: getState
            };
        }
    );
})();

