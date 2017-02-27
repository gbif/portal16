//http://stackoverflow.com/questions/17547917/angularjs-image-onload-event
'use strict';
var angular = require('angular');

angular
    .module('portal')
    .directive('helpDesk', function ($parse, $rootScope, NAV_EVENTS) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                elem.on('click', function (event) {
                    $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true, type: 'QUESTION'});
                    scope.$apply(function() {
                    });
                });
            }
        };
    });
