'use strict';
var angular = require('angular'),
    SimpleMDE = require('simplemde');

angular
    .module('portal')
    .directive('markdownEditor', function() {
        return {
            restrict: 'A',
            scope: {
                onMdeChange: '='
            },
            link: function(scope, element, attrs) {
                var simplemde = new SimpleMDE({element: element[0]});
                simplemde.codemirror.on('change', function() {
                    scope.$apply(function(scope) {
                        scope.onMdeChange(simplemde.value());
                    });
                });
            }
        };
    });
