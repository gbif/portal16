(function () {
    'use strict';
    var angular = require('angular');

    angular
        .module('portal')
        .filter('prettifyEnum', function() {
            return function(text) {
                if (typeof text === 'undefined') {
                    return '';
                }
                return text.charAt(0) + text.slice(1).toLowerCase().replace(/_/g, ' ');
            }
        })

})();