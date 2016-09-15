(function () {
    'use strict';
    var angular = require('angular');

    angular
        .module('portal')
        .filter('prettifyEnum', function() {
            return function(text) {
                if (typeof text === 'undefined') {
                    return '';
                }
                return text.charAt(0) + text.slice(1).toLowerCase().replace(/_/g, ' ');
            }
        })
        .filter('truncate', function() {
            return function(text, length) {
                length = length || 10;
                if (typeof text !== 'string') {
                    return '';
                }
                return text.length > length ? text.slice(0, length) + '…' : text;
            }
        })
        .filter('encodeURIComponent', function() {
            return window.encodeURIComponent;
        })
        .filter('localNumber', function() {
            return function(num, lang) {
                if (angular.isUndefined(num)) return '';
                return num.toLocaleString(lang);
            }
        })
        .filter('stripTags', function() {
            return function(text) {
                return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
            };
        })
        .filter('unique', function() {
            return function(a) {
                if (angular.isString(a)) return [a];
                if (!Array.isArray(a)) return [];
                var n = {},r=[];
                for(var i = 0; i < a.length; i++)
                {
                    if (!n[a[i]])
                    {
                        n[a[i]] = true;
                        r.push(a[i]);
                    }
                }
                return r;
            }
        })
        .filter('uniqueLower', function() {
            return function(a) {
                if (angular.isString(a)) return [a.toString().toLowerCase()];
                if (!Array.isArray(a)) return [];
                var n = {},r=[];
                for(var i = 0; i < a.length; i++)
                {
                    var val = a[i].toString().toLowerCase();
                    if (!n[val])
                    {
                        n[val] = true;
                        r.push(val);
                    }
                }
                return r;
            }
        })
})();