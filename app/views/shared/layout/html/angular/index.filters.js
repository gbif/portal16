(function () {
    'use strict';
    var angular = require('angular'),
        Humanize = require('humanize-plus');

    angular
        .module('portal')
        .filter('prettifyEnum', function () {
            return function (text) {
                if (typeof text === 'undefined') {
                    return '';
                }
                return text.charAt(0) + text.slice(1).toLowerCase().replace(/_/g, ' ');
            }
        })
        .filter('truncate', function () {
            return function (text, length) {
                length = length || 10;
                if (typeof text !== 'string') {
                    return '';
                }
                return text.length > length ? text.slice(0, length) + '…' : text;
            }
        })
        .filter('underscoreToHyphen', function () {
            return function (text) {
                return text.replace(/_/g, '-');
            }
        })
        .filter('compactInteger', function () {
            return function (nr) {
                return Humanize.compactInteger(nr, 0);
            }
        })
        .filter('encodeURIComponent', function () {
            return window.encodeURIComponent;
        })
        .filter('localNumber', function () {
            return function (num, lang) {
                if (angular.isUndefined(num)) return '';
                return num.toLocaleString(lang);
            }
        })
        .filter('startFrom', function () {
            return function (input, start) {
                start = +start; //parse to int
                return input.slice(start);
            }
        })
        .filter('stripTags', function () {
            return function (text) {
                return text ? String(text).replace(/<[^>]+>/gm, '') : '';
            };
        })
        .filter('unique', function () {
            return function (a) {
                if (angular.isString(a)) return [a];
                if (!Array.isArray(a)) return [];
                var n = {}, r = [];
                for (var i = 0; i < a.length; i++) {
                    if (!n[a[i]] && typeof a[i] !== 'undefined') {
                        n[a[i]] = true;
                        r.push(a[i]);
                    }
                }
                return r;
            }
        })
        .filter('uniqueLower', function () {
            return function (a) {
                if (angular.isString(a)) return [a.toString().toLowerCase()];
                if (!Array.isArray(a)) return [];
                var n = {}, r = [];
                for (var i = 0; i < a.length; i++) {
                    var val = a[i].toString().toLowerCase();
                    if (!n[val]) {
                        n[val] = true;
                        r.push(val);
                    }
                }
                return r;
            }
        })
        .filter('authorFirstName', function(){
            return function(text) {
                return (text) ? text.charAt(0).toUpperCase() + '.' : '';
            }
        })
        .filter('formatBytes', function(){
            return function(bytes, decimals, language) {
                if (bytes == 0) return '0 Bytes';
                if (bytes == 1) return '1 Byte';
                var k = 1000;
                var dm = decimals || 0;
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                var i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toLocaleString(language) + ' ' + sizes[i];
            }
        })
        .filter('formatAsPercentage', function(){
            return function(percentage) {
                var formatedPercentage = 0;
                if (!isFinite(percentage)) {
                    return percentage;
                }
                percentage = 100 * percentage;
                if (percentage == 100) {
                    formatedPercentage = 100;
                } else if (percentage >= 99.9) {
                    formatedPercentage = 99.9;
                } else if (percentage > 99) {
                    formatedPercentage = percentage.toFixed(1);
                } else if (percentage >= 1) {
                    formatedPercentage = percentage.toFixed();
                } else if (percentage >= 0.01) {
                    formatedPercentage = percentage.toFixed(2);
                } else if (percentage < 0.01 && percentage != 0) {
                    formatedPercentage = 0.01;
                }
                return formatedPercentage;
            }
        })
})();