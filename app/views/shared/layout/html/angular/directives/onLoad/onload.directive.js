// http://stackoverflow.com/questions/17547917/angularjs-image-onload-event
'use strict';
let angular = require('angular');

angular
    .module('portal')
    .directive('gbLoad', function($parse, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                let fn = $parse(attrs.gbLoad);
                elem.on('load', function(event) {
                    elem.parent().removeClass('isInvalid');
                    $timeout(function() {
                        fn(scope, {$event: event});
                    });
                });
                elem.on('error', function() {
                    elem.parent().addClass('isInvalid');
                    $timeout(function() {
                        fn(scope, {$event: event});
                    });
                });
            },
        };
    });
