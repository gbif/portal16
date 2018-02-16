'use strict';


angular
    .module('portal')
    .factory('validatorFeedbackService', function($rootScope, NAV_EVENTS) {
        let toggleGroup = [
            NAV_EVENTS.toggleSearch,
            NAV_EVENTS.toggleFeedback,
            NAV_EVENTS.toggleNotifications,
            NAV_EVENTS.toggleUserMenu,
        ];

        let openMenu = function(navEvent) {
            toggleGroup.forEach(function(e) {
                if (e === navEvent) {
                    $rootScope.$broadcast(e, {state: true});
                } else {
                    $rootScope.$broadcast(e, {state: false});
                }
            });
        };

        return {
            toggleFeedback: function() {
                openMenu(NAV_EVENTS.toggleFeedback);
            },

        };
    });

