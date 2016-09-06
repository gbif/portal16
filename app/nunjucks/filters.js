var glob = require('glob'),
    format = require('../helpers/format'),
    _ = require('lodash'),
    path = require('path');

module.exports = function(nunjucksConfiguration, config) {

    (function() {
        nunjucksConfiguration.addFilter('rawJson', function(data) {
            return JSON.stringify(data);
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('formatDate', format.date);
    })();

    (function() {
        nunjucksConfiguration.addFilter('highlighted', format.getHighlightedText);
    })();


    (function() {
        nunjucksConfiguration.addFilter('limit', function(data, limit) {
            return data && data.constructor === Array ? data.slice(0, limit) : undefined;
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('slice', function(data, start, amount) {
            return data && (data.constructor === Array || typeof(data) === 'string') ? data.slice(start, amount) : undefined;
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('locInt', format.localizeInteger);
    })();

    (function() {
        nunjucksConfiguration.addFilter('wordBreakToHyphen', function(data) {
            var newstr = data.replace('_', '-');
            return newstr;
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('isUndefined', function(data) {
            return typeof data === 'undefined';
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('isDefined', function(data) {
            return typeof data !== 'undefined';
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('isNotEmpty', function(data) {
            return !_.isEmpty(data);
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('prettifyEnum', format.prettifyEnum);
    })();

    (function() {
        nunjucksConfiguration.addFilter('isLink', function(data) {
            if (!data) {
                return false;
            }
            //var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            var expression = /^(http)(s)?(:\/\/)[^ ]*$/gi;
            var regex = new RegExp(expression);
            return !!data.toString().match(regex);
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('truncateMiddle', function(data, len) {
            if (!data) {
                return false;
            }
            data = data.toString();
            if (data.length < len) {
                return data;
            }
            if (len < 20) {
                return data.slice(0,len-3) + '...';
            }
            var splitLength = (len/2)-3;
            return data.slice(0,splitLength) + '...' + data.slice(data.length-splitLength)
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('minTableWidth', function(data, div, max) {
            div = div || 1;
            max = max || 200;
            if (!data) {
                return 0;
            }
            return Math.round(Math.min(max, data.toString().length / div));
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('encodeURI', function(data) {
            if (!data) {
                return ''
            }
            return encodeURIComponent(data);
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('formatByte', format.formatBytes);
    })();

    (function() {
        nunjucksConfiguration.addFilter('localizeInteger', format.localizeInteger);
    })();

    /**
    DEPRECATED
    Moved away from this and use source maps instead
    The idea is to inject the files without concatenation in development.
    Given a folder it inject all files in alphabetical order
    During gulp build the files should have a folder structure corresponding the depdencies order.
    insert using:
    {{ 'main' | assets('css' | safe )}} 
    => 
    <link rel="stylesheet" href="firstFile.css">
    <link rel="stylesheet" href="fileThatDependsOnFirstFile.css">
    */
    (function() {
        var injectStaticMap = {};
        nunjucksConfiguration.addFilter('assets', function(location, type) {
            if (type !== 'css' && type !== 'js') {
                //missing parameter that defines type
                return;
            }
            var preFetched = injectStaticMap[location + '_' + type];
            if (preFetched) {
                return preFetched;
            }

            var template = type === 'css' ? '<link rel="stylesheet" href="{file}">' : '<script src="{file}"></script>'
            var files = glob.sync(config.root + '/public/' + location + '/**/*.' + type);
            var scriptTags = files.sort().reduce(function(previousValue, currentValue) {
                var value = path.relative(config.root + '/public/', currentValue);
                return previousValue + template.replace('{file}', value);
            }, '');

            injectStaticMap[location + '_' + type] = scriptTags;
            return scriptTags;
        });

    })();

};