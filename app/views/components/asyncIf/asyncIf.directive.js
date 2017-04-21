'use strict';
var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('asyncIf', function ($http) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var url = attrs['asyncIf'];
                $http.get(url, {
                    params: {
                        limit: 0
                    }
                }).then(function (response) {
                    if (_.get(response, 'data.count', 0) > 0 || response.data === 'true') {
                        element.removeClass('asyncIf--isHidden')
                    }
                    element.addClass('loaded');
                });
            }
        };
    });

