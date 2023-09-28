(function () {
    'use strict';
    var angular = require('angular'),
        Humanize = require('humanize-plus'),
        md = require('marked'),
        moment = require('moment'),
        filters = require('./filters'),
        _ = require('lodash'),
        md5 = require('md5');

    md.setOptions({
        renderer: new md.Renderer(),
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
    });

    // Get reference
    var renderer = new md.Renderer();

    // Override function
    renderer.link = function (href, title, text) {
        title = title || '';
        if (href.substr(0, 1) === '/') {
            href = window.gb.urlPrefix + href;
        }
        return '<a title="' + title + '" href="' + href + '">' + text + '</a>';
    };

    angular
        .module('portal')
        .filter('prettifyEnum', function () {
            return function (text) {
                if (typeof text === 'undefined') {
                    return '';
                }
                return text.charAt(0) + text.slice(1).toLowerCase().replace(/_/g, ' ');
            };
        })
        .filter('vocabularyLabel', function (LOCALE_MAPPINGS, LOCALE) {
            return function (concept) {
                if (typeof concept === 'undefined') {
                    return 'Unknown';
                }
                var vocabLocale = LOCALE_MAPPINGS.vocabulary[LOCALE] || 'en';
                // map the concept labels to a map keyed on language
                if (concept.label) {
                    var labelMap = {};
                    concept.label.forEach(function (label) {
                        labelMap[label.language] = label.value;
                    });
                    return labelMap[vocabLocale] || labelMap.en || concept.name;
                } else {
                    return concept.name;
                }
            };
        })
        .filter('startsWith', function () {
            return function (text, match) {
                if (typeof text === 'undefined') {
                    return false;
                }
                return text.substr(0, match.length) == match;
            };
        })
        .filter('truncate', function () {
            return filters.truncate;
        })
        .filter('snakeCase', function () {
            return function (text) {
                return _.snakeCase(text);
            };
        })
        .filter('camelCase', function () {
            return function (text) {
                return _.camelCase(text);
            };
        })
        .filter('underscoreToHyphen', function () {
            return function (text) {
                return text.replace(/_/g, '-');
            };
        })
        .filter('spaceToHyphen', function () {
            return function (text) {
                return text.replace(/\s/g, '-');
            };
        })
        .filter('flag', function (BUILD_VERSION) {
            return function (countryCode) {
                if (countryCode) {
                    return '/img/flags/' + _.toUpper(countryCode) + '.png?v=' + BUILD_VERSION;
                } else {
                    return '';
                }
            };
        })
        .filter('isPast', function () {
            return function (date) {
                return moment(date).isBefore();
            };
        })
        .filter('isNew', function () {
            return function (date) {
                return moment().subtract(90, 'd').isBefore(date);
            };
        })
        .filter('momentFormat', function (LOCALE, LOCALE_MAPPINGS) {
            return function (date, format) {
                moment.locale(LOCALE_MAPPINGS.moment[LOCALE]);
                if (!date) return '';
                if (format === 'LL') {
                    date = date.substr(0, 10);
                }
                return moment(date).format(format || 'LLLL');
            };
        })
        .filter('momentFormatRange', function (LOCALE, LOCALE_MAPPINGS) {
            const formats = ['YYYY', 'YYYY MMM', 'YYYY MMM DD'];
            return function (date, format) {
                moment.locale(LOCALE_MAPPINGS.moment[LOCALE]);
                if (!date) return '';
                if (format === 'LL') {
                    date = date.substr(0, 10);
                }
                if (date.indexOf('/') > -1) {
                    var dates = date.split('/');
                    let firstParts = dates[0].split('-');
                    let secondParts = dates[1].split('-');

                    return moment(dates[0]).format(format || formats[firstParts.length - 1] || 'LLLL') + ' - ' + moment(dates[1]).format(format || formats[secondParts.length - 1] || 'LLLL');
                } else {
                    let firstParts = date.split('-');
                    return moment(date).format(format || formats[firstParts.length - 1] || 'LLLL');
                }
            };
        })
        .filter('momentFormatEnglish', function (LOCALE_MAPPINGS) {
            return function (date, format) {
                moment.locale(LOCALE_MAPPINGS.moment['en']);
                if (!date) return '';
                if (format === 'LL') {
                    date = date.substr(0, 10);
                }
                return moment(date).format(format || 'LLLL');
            };
        })
        .filter('momentFromNow', function (LOCALE, LOCALE_MAPPINGS) {
            moment.locale(LOCALE_MAPPINGS.moment[LOCALE]);
            return function (date, format) {
                return moment(date).fromNow();
            };
        })
        .filter('stripTags', function () {
            return function (html) {
                var tmp = document.createElement('DIV');
                tmp.innerHTML = html;
                return tmp.textContent || tmp.innerText || '';
            };
        })
        .filter('compactInteger', function () {
            return function (nr) {
                return Humanize.compactInteger(nr, 0);
            };
        })
        .filter('encodeURIComponent', function () {
            return window.encodeURIComponent;
        })
        .filter('imgCache', function (env) {
            return function (imgUrl, width, height) {
                if (width || height) {
                    return env.imageCache + (width || '') + 'x' + (height || '') + '/' + window.encodeURIComponent(imgUrl);
                } else {
                    return env.imageCache + window.encodeURIComponent(imgUrl);
                }
            };
        })
        .filter('occurrenceImgCache', function (env) {
            return function (identifier, occurrenceKey, params) {
                if (params) {
                    return env.customImageCache + params + '/occurrence/' + occurrenceKey + '/media/' + md5(identifier);
                } else {
                    return env.customImageCache + 'occurrence/' + occurrenceKey + '/media/' + md5(identifier);
                }
            };
        })
        .filter('localNumber', function (LOCALE_MAPPINGS, LOCALE) {
            return function (num, lang) {
                lang = lang ? LOCALE_MAPPINGS.numbers[lang] : (LOCALE_MAPPINGS.numbers[LOCALE] || LOCALE);
                if (_.isNil(num)) return '';
                return num.toLocaleString(lang);
            };
        })
        .filter('startFrom', function () {
            return function (input, start) {
                start = +start; // parse to int
                return input.slice(start);
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
            };
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
            };
        })
        .filter('authorFirstName', function () {
            return function (text) {
                return (text) ? text.charAt(0).toUpperCase() + '.' : '';
            };
        })
        .filter('MathAbs', function () {
            return function (num) {
                return Math.abs(num);
            };
        })
        .filter('visibleIdentifier', function () {
            return function (arr) {
                return arr.filter(function (identifier) {
                    return [
                        'URL',
                        'LSID',
                        'HANDLER',
                        'DOI',
                        'UUID',
                        'FTP',
                        'URI',
                        'ROR',
                        'GRID',
                        'GRBIO_URI',
                        'GRSCICOLL_URI'
                    ].indexOf(identifier.type) >= 0;
                });
            };
        })
        .filter('visibleRoles', function () {
            return function (arr) {
                return arr.filter(function (role) {
                    var roleString = typeof role === 'string' ? role : role.role;
                    return [
                        'HEAD_OF_DELEGATION_ADMINISTRATIVE_CONTACT'
                    ].indexOf(roleString) === -1;
                });
            };
        })
        .filter('httpParamSerializer', function ($httpParamSerializer) {
            return function (obj) {
                var query = angular.copy(obj);
                query = _.omitBy(query, angular.isUndefined);
                return $httpParamSerializer(query);
            };
        })
        .filter('formatBytes', function (LOCALE, LOCALE_MAPPINGS) {
            return function (bytes, decimals, language) {
                language = language ? LOCALE_MAPPINGS.numbers[language] : (LOCALE_MAPPINGS.numbers[LOCALE] || LOCALE);
                if (bytes == 0) return '0 Bytes';
                if (bytes == 1) return '1 Byte';
                var k = 1000;
                var dm = decimals || 0;
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                var i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toLocaleString(language) + ' ' + sizes[i];
            };
        })
        .filter('formatAsPercentage', function () {
            return function (percentage, max) {
                var formatedPercentage = 0;
                if (!isFinite(percentage)) {
                    return percentage;
                }
                percentage = 100 * percentage;
                if (percentage > 101) {
                    formatedPercentage = percentage.toFixed();
                } else if (percentage > 100.1) {
                    formatedPercentage = percentage.toFixed(1);
                } else if (percentage > 100) {
                    formatedPercentage = 100.1;
                } else if (percentage == 100) {
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
                if (formatedPercentage > max) {
                    formatedPercentage = max;
                }
                return formatedPercentage;
            };
        })
        .filter('parseUrlFilter', function () {
            // eslint-disable-next-line no-useless-escape
            var urlPattern = /(www|http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
            return function (text, target, clazz) {
                target = target || '_blank';
                if (typeof text === 'string') {
                    angular.forEach(text.match(urlPattern), function (url) {
                        var urlPos = text.indexOf(url);
                        if (text.substr(urlPos - 6, 4).indexOf('src') == -1) {
                            text = text.replace(url, '<a target="' + target + '" href=' + url + ' class=' + clazz + '>' + url + '</a>');
                        }
                    });
                }

                return text;
            };
        })
        .filter('md2html', function () {
            return function (markdown) {
                return (markdown) ? md(markdown, { renderer: renderer }) : '';
            };
        })
        .filter('gbifUrlAsRelative', function () {
            return function (url) {
                var parseUrl = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
                var result = parseUrl.exec(url);

                var host = result[3];
                var path = result[5];
                var locale = (!gb.locale || gb.locale === 'en') ? '' : gb.locale + '/';
                if (!host) {
                    return url;
                }
                switch (host) {
                    case 'www.gbif.org':
                        return '/' + locale + path;
                    case 'gbif.org':
                        return '/' + locale + path;
                    case 'www.gbif-staging.org':
                        return '/' + locale + path;
                    case 'gbif-staging.org':
                        return '/' + locale + path;
                    case 'www.gbif-uat.org':
                        return '/' + locale + path;
                    case 'gbif-uat.org':
                        return '/' + locale + path;
                    case 'www.gbif-dev.org':
                        return '/' + locale + path;
                    case 'gbif-dev.org':
                        return '/' + locale + path;
                    default:
                        return url;
                }
            };
        })
        .filter('capitalizeFirstLetter', function () {
            return function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            };
        })
        .filter('deCapitalizeFirstLetter', function () {
            return function (string) {
                return string.charAt(0).toLowerCase() + string.slice(1);
            };
        });
})();
