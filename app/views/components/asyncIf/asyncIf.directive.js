'use strict';
let angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('asyncIf', function($http) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                let url = attrs['asyncIf'];
                let key = attrs['asyncIfKey'];
                $http.get(url, {
                    params: {
                        limit: 0,
                    },
                }).then(function(response) {
                    if ( (key && _.get(response, 'data.' + key, 0) > 0) || _.get(response, 'data.count', 0) > 0 || response.data === 'true') {
                        element.removeClass('asyncIf--isHidden');
                    }
                    element.addClass('loaded');
                });
            },
        };
    });

