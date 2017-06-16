'use strict';
var angular = require('angular');

angular
    .module('portal')
    .directive('elementQuery', function ($window) {
        return {
            restrict: 'A',
            scope: {
                elementQuery: '='
            },
            link: function (scope, element) { //attrs
                var length = scope.elementQuery.breakpoints.length;
                function updateSize() {
                    var largestIndex = 0,
                        width = element[0].clientWidth;
                    for (var i = 0; i < length; i++) {
                        element.removeClass(scope.elementQuery.classes[i]);
                        if (width > scope.elementQuery.breakpoints[i]) {
                            largestIndex = i;
                        }
                    }
                    element.addClass(scope.elementQuery.classes[largestIndex]);
                    scope.elementQuery.current = largestIndex;
                }
                updateSize();
                angular.element($window).bind('resize', function(){
                    updateSize();
                });
            }
        };
    });

