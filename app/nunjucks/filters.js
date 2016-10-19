var format = require('../helpers/format'),
    _ = require('lodash'),
    fs = require('fs');

module.exports = function (nunjucksConfiguration, config) {

    (function () {
        nunjucksConfiguration.addFilter('rawJson', function (data) {
            return JSON.stringify(data);
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('formatDate', format.date);
    })();

    (function () {
        nunjucksConfiguration.addFilter('limit', function (data, limit) {
            return data && data.constructor === Array ? data.slice(0, limit) : undefined;
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('slice', function (data, start, amount) {
            return data && (data.constructor === Array || typeof(data) === 'string') ? data.slice(start, amount) : undefined;
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('locInt', format.localizeInteger);
    })();

    (function () {
        nunjucksConfiguration.addFilter('prettifyLicense', format.prettifyLicense);
    })();

    (function () {
        nunjucksConfiguration.addFilter('sanitize', format.sanitize);
    })();

    (function () {
        nunjucksConfiguration.addFilter('wordBreakToHyphen', function (data) {
            var newstr = data.replace('_', '-');
            return newstr;
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('isUndefined', function (data) {
            return typeof data === 'undefined';
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('isDefined', function (data) {
            return typeof data !== 'undefined';
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('isNotEmpty', function (data) {
            return !_.isEmpty(data);
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('prettifyEnum', format.prettifyEnum);
    })();

    (function () {
        nunjucksConfiguration.addFilter('merge', function (obj1, obj2) {
            return _.merge(obj1, obj2);
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('remove', function (text, character) {
            return text.replace(character, '')
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('isLink', function (data) {
            if (!data) {
                return false;
            }
            //var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            var expression = /^(http)(s)?(:\/\/)[^ ]*$/gi;
            var regex = new RegExp(expression);
            return !!data.toString().match(regex);
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('truncateMiddle', function (data, len) {
            if (!data) {
                return false;
            }
            data = data.toString();
            if (data.length < len) {
                return data;
            }
            if (len < 20) {
                return data.slice(0, len - 3) + '...';
            }
            var splitLength = (len / 2) - 3;
            return data.slice(0, splitLength) + '...' + data.slice(data.length - splitLength)
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('minTableWidth', function (data, div, max) {
            div = div || 1;
            max = max || 200;
            if (!data) {
                return 0;
            }
            return Math.round(Math.min(max, data.toString().length / div));
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('encodeURI', function (data) {
            if (!data) {
                return ''
            }
            return encodeURIComponent(data);
        });
    })();

    (function () {
        nunjucksConfiguration.addFilter('formatByte', format.formatBytes);
    })();

    (function () {
        nunjucksConfiguration.addFilter('localizeInteger', format.localizeInteger);
    })();

    /**
     * Generates the absoulte path to the country flag for the given iso code.
     * Remember to use it with the rev filter for versioned assets.
     */
    (function () {
        nunjucksConfiguration.addFilter('flag', function (countryCode) {
            if (countryCode) {
                return '/img/flags/' + _.toUpper(countryCode)+ ".png";
            }
        });
    })();

    /**
     * filter that uses the rev-manifest.json to change versioned asset file paths.
     * The path to the file should be the full absolute path in the public folder to the unrev'ed asset.
     *
     * <img src="{$ code | flag | rev $}"/>
     * =>
     * <img src="/img/flags/DK-8257f70c13.png"/>
     */
    (function () {
        var revManifest;
        var revFile = 'public/rev-manifest.json';
        if (fs.existsSync(revFile)) {
            revManifest = JSON.parse(fs.readFileSync(revFile, 'utf8'));
            console.log("Loaded asset versioning manifest at "+revFile+" with "+Object.keys(revManifest).length+" entries.");
        } else {
            revManifest = {};
        }
        nunjucksConfiguration.addFilter('rev', function (location) {
            location = _.trimStart(location, '/');
            console.log(location);
            if (location in revManifest) {
                return "/" + revManifest[location];
            }
            return location;
        });
    })();

};
