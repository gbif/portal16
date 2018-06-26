'use strict';
var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .directive('tx', function($http, $filter, LOCALE, $translate) {
        return {
            restrict: 'A',
            scope: {
                txNr: '=',
                tx: '@'
            },
            link: function(scope, element, attrs) {
                scope.$watch('txNr', function(newValue, oldValue) {
                    var nr = typeof(newValue) !== 'undefined' ? newValue : oldValue;
                    nr = _.toSafeInteger(nr);
                    $translate(scope.tx, {NUMBER: nr, NUMBER_FORMATED: nr.toLocaleString(LOCALE)}).then(function(translation) {
                        element.html(translation);
                    });
                }, true);
            }
        };
    });
