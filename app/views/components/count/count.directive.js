'use strict';
var angular = require('angular');

angular
    .module('portal')
    .directive('count', function ($http, $filter) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var url = attrs.count;
                element.html('<span class="loading"></span>');
                $http.get(url, {
                    params: {
                        limit: 0
                    }
                }).then(function (response) {
                    window.setTimeout(function(){
                        var number = $filter('localNumber')(response.data.count, gb.locale);
                        element.html(number);
                        element.addClass('loaded');
                    }, 5000);
                    //var number = $filter('localNumber')(response.data.count, gb.locale);
                    //element.html(number);
                    //element.addClass('loaded');
                });
            }
        };
    });