(function () {
    'use strict';
    var angular = require('angular');

    angular
        .module('portal')
        .constant('NAV_EVENTS', {
            toggleFeedback: 'toggleFeedback',
            toggleSearch: 'toggleSearch'
        })
})();