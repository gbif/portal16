'use strict';
var angular = require('angular');

//@see http://stackoverflow.com/questions/24200909/apply-loading-spinner-during-ui-router-resolve
//@todo to be deleted once the generic loading prompt is in place.

angular
    .module('portal')
    .directive('noticeWhileResolving', function($rootScope){
        return {
            link: function(scope, element) {
                element.addClass('ng-hide');
                var unregister = $rootScope.$on('$routeChangeStart', function() {
                    element.removeClass('ng-hide');
                });
                scope.$on('$destroy', unregister);
            }
        };
    })
    .directive('resolveLoader', function($rootScope, $timeout){
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="alert alert-success ng-hide">Loading...</div>',
            link: function(scope, element) {

                $rootScope.$on('$routeChangeStart', function(event, currentRoute, previousRoute) {
                    if (previousRoute) return;

                    $timeout(function() {
                        element.removeClass('ng-hide');
                    });
                });

                $rootScope.$on('$routeChangeSuccess', function() {
                    element.addClass('ng-hide');
                });
            }
        };
    });