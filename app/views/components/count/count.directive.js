'use strict';
var angular = require('angular');

angular
    .module('portal')
    .directive('count', function($http, $filter, $q, LOCALE) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var url = attrs.count;
                element.html('<span class="loading"></span>');

                var countPromise = $http.get(url, {
                    params: {
                        limit: 0
                    }
                });

                var promise = (typeof attrs.subtract === 'undefined') ? countPromise : $q.all([countPromise, $http.get(attrs.subtract, {
                    params: {
                        limit: 0
                    }
                })]).then(function(response) {
                    response[0].data.count = (response[0].data.count - response[1].data.count);
                    return response[0];
                });

                promise.then(function(response) {
                    var number = $filter('localNumber')(response.data.count, LOCALE);
                    element.html(number);
                    element.addClass('loaded');
                }).catch(function() {
                    // swallow errors//TODO how to handle this in a gerneal way. in some cases, the count is essential
                });
            }
        };
    });
