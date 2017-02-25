//http://stackoverflow.com/questions/17547917/angularjs-image-onload-event
'use strict';
var angular = require('angular');

angular
    .module('portal')
    .directive('gbLoad', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                var fn = $parse(attrs.gbLoad);
                elem.on('load', function (event) {
                    elem.parent().removeClass('isInvalid');
                    scope.$apply(function() {
                        fn(scope, { $event: event });
                    });
                });
                elem.on('error', function () {
                    elem.parent().addClass('isInvalid');
                    scope.$apply(function() {
                        fn(scope, { $event: event });
                    });
                });
            }
        };
    });

