(function() {
    'use strict';
    let angular = require('angular');

    angular
        .module('portal')
        .constant('NAV_EVENTS', {
            toggleFeedback: 'toggleFeedback',
            toggleSearch: 'toggleSearch',
            toggleUserMenu: 'toggleUserMenu',
            toggleNotifications: 'toggleNotifications',
        });
})();
