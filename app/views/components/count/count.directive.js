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
                    var number = $filter('localNumber')(response.data.count, gb.locale);
                    element.html(number);
                    element.addClass('loaded');
                }).catch(function(){
                    //swallow errors//TODO how to handle this in a gerneal way. in some cases, the count is essential
                });
            }
        };
    });
