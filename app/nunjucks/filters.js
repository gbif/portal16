let format = require('../helpers/format');
let _ = require('lodash');
let changeCase = require('change-case');
let urlRegex = require('url-regex');
let truncate = require('html-truncate');
let url = require('url');
let md = require('markdown-it')({html: true, linkify: true, typographer: false, breaks: true});
    md.linkify.tlds('fuzzyLink', false);

    md.use(require('markdown-it-video'), {
        youtube: {width: 640, height: 390},
        vimeo: {width: 500, height: 281},
        vine: {width: 600, height: 600, embed: 'simple'},
        prezi: {width: 550, height: 400}
    });

    md.use(require('markdown-it-imsize'), {autofill: false});

    // adding anchor headers to markdown would be nice, but the problem is the navbar offset
    // md.use(require('markdown-it-anchor'), {
    //    level: 1,
    //    slugify: function(str){return '_' + format.getSlug(str)},
    //    permalink: true,
    //    // renderPermalink: (slug, opts, state, permalink) => {},
    //    permalinkClass: 'gb-icon-link header-anchor inherit noUnderline',
    //    permalinkSymbol: '',
    //    permalinkBefore: false
    // });

module.exports = function(nunjucksConfiguration) {
    (function() {
        nunjucksConfiguration.addFilter('rawJson', function(data, pretty) {
            if (pretty) {
                return JSON.stringify(data, undefined, 2);
            } else {
                return JSON.stringify(data);
            }
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('quoteLinks', function(text) {
            if (_.isString(text)) {
                return text.replace(urlRegex(), '`$&`');
            }
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('formatDate', format.date);
    })();

    (function() {
        nunjucksConfiguration.addFilter('dateRange', format.dateRange);
    })();

    (function() {
        nunjucksConfiguration.addFilter('timeRange', format.timeRange);
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
        nunjucksConfiguration.addFilter('uniqBy', function(arr, keys) {
            return _.uniqBy(arr, function(e) {
                return _.reduce(keys, function(identifier, key) {
                    return identifier + ' ' + e[key];
                }, '');
            });
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('addition', function(number, otherNumbers) {
            if (!_.isArray(otherNumbers)) {
                otherNumbers = [otherNumbers];
            }
            otherNumbers.push(number);
            return _.sumBy(otherNumbers, function(nr) {
                return _.isFinite(nr) ? nr : 0;
            });
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('hasAtLeastOneKey', function(element, keys) {
            if (_.isArray(keys)) {
                for (let i = 0; i < keys.length; i++) {
                    let e = _.get(element, keys[i]);
                    if (_.isObjectLike(e)) {
                        if (!_.isEmpty(e)) {
                            return true;
                        }
                    } else if (!_.isNil(e)) {
                        return true;
                    }
                }
            }
            return false;
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('length', function(data) {
            return data && (data.constructor === Array || typeof(data) === 'string') ? data.length : undefined;
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('toCamelCase', format.toCamelCase);
    })();

    (function() {
        nunjucksConfiguration.addFilter('constantCase', changeCase.constantCase);
    })();

    (function() {
        nunjucksConfiguration.addFilter('reduceUrlToDomain', format.reduceUrlToDomain);
    })();

    (function() {
        nunjucksConfiguration.addFilter('compactInteger', format.compactInteger);
    })();

    (function() {
        nunjucksConfiguration.addFilter('prettifyLicense', format.prettifyLicense);
    })();

    (function() {
        nunjucksConfiguration.addFilter('sanitize', format.sanitize);
    })();

    (function() {
        nunjucksConfiguration.addFilter('sanitizeTrusted', format.sanitizeTrusted);
    })();

    (function() {
        nunjucksConfiguration.addFilter('localizeLinks', format.localizeLinks);
    })();

    (function() {
        nunjucksConfiguration.addFilter('localizeLink', format.localizeLink);
    })();

    (function() {
        nunjucksConfiguration.addFilter('addPortalClasses', format.addPortalClasses);
    })();

    (function() {
        nunjucksConfiguration.addFilter('wordBreakToHyphen', function(data) {
            let newstr = data.replace('_', '-');
            return newstr;
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('renderMarkdown', function(markdownText) {
            if (_.isString(markdownText)) {
                return md.render(markdownText);
            } else {
                return '';
            }
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('renderTrustedMarkdown', function(markdownText, urlPrefix) {
            if (_.isString(markdownText)) {
                return format.addPortalClasses(format.localizeLinks(format.sanitizeTrusted(md.render(markdownText)), urlPrefix));
            } else {
                return '';
            }
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('isUndefined', function(data) {
            return typeof data === 'undefined';
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('find', function(data, predicate) {
            if (!_.isArray(data)) {
                return undefined;
            }
            return _.find(data, predicate);
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
        nunjucksConfiguration.addFilter('isEmpty', function(data) {
            return _.isEmpty(data);
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('prettifyEnum', format.prettifyEnum);
    })();

    (function() {
        nunjucksConfiguration.addFilter('merge', function(obj1, obj2) {
            return _.merge(obj1, obj2);
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('remove', function(text, character) {
            return text.replace(character, '');
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('isLink', function(data) {
            if (typeof data !== 'string') {
                return false;
            }
            return urlRegex({exact: true}).test(data);
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('asLink', function(data) {
            if (typeof data !== 'string') {
                return false;
            }
            if (data.startsWith('urn:lsid:')) {
                return 'http://lsid.info/' + data;
            }
            return false;
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('linkify', format.linkify);
    })();

    (function() {
        nunjucksConfiguration.addFilter('insertLinks', format.insertLinks);
    })();

    (function() {
        nunjucksConfiguration.addFilter('getDOILink', format.getDOILink);
    })();

    (function() {
        nunjucksConfiguration.addFilter('readableDOI', format.readableDOI);
    })();

    (function() {
        nunjucksConfiguration.addFilter('decodeHtml', format.decodeHtml);
    })();

    (function() {
        nunjucksConfiguration.addFilter('encodeHtml', format.encodeHtml);
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
                return data.slice(0, len - 3) + '...';
            }
            let splitLength = (len / 2) - 3;
            return data.slice(0, splitLength) + '...' + data.slice(data.length - splitLength);
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('truncate', function(text, length) {
            length = length || 10;
            if (typeof text !== 'string') {
                return '';
            }
            return text.length > length ? text.slice(0, length) + '…' : text;
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('truncateHtml', function(htmlText, len) {
            if (!_.isString(htmlText)) {
                return '';
            }
            return truncate(htmlText, len);
        });
    })();

    // TODO Is this use anywhere or a duplicate or reduceUrlToDomain
    (function() {
        nunjucksConfiguration.addFilter('domain', function(url) {
            if (!_.isString(url)) {
                return url;
            }
            let matches = url.match(/^(?:https?:\/\/)?(?:www\.)?([^/?#:]+)/i);
            return matches ? matches[1] : url;
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
        nunjucksConfiguration.addFilter('fileContentTypeToIconName', function(contentType) {
            switch (contentType) {
                case 'application/pdf':
                    return 'pdf';
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    return 'doc';
                case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                    return 'ppt';
                default:
                    return 'download';
            }
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('encodeURI', function(data) {
            if (!data) {
                return '';
            }
            return encodeURIComponent(data);
        });
    })();

    (function() {
        nunjucksConfiguration.addFilter('formatByte', format.formatBytes);
    })();

    (function() {
        nunjucksConfiguration.addFilter('flag', function(countryCode, buildVersion) {
            if (countryCode) {
                return '/img/flags/' + _.toUpper(countryCode) + '.png?v=' + buildVersion;
            }
        });
    })();

    /**
     * A hacky way to match social media links to the icons we have
     */
    (function() {
        let mediaIconMap = {
            'twitter.com': 'twitter',
            'facebook.com': 'facebook',
            'plus.google.com': 'google_plus',
            'instagram.com': 'instagram',
            'linkedin.com': 'linkedin',
            'pinterest.com': 'pinterest',
            'vimeok.com': 'vimeo',
            'youtube.com': 'youtube'
        };
        nunjucksConfiguration.addFilter('socialMediaIcon', function(media) {
            if (media) {
                let mediaHostName = url.parse(media).hostname;
                mediaHostName = mediaHostName.replace('www.', '');
                let knownMedia = mediaIconMap[mediaHostName];
                if (knownMedia) {
                    return '/img/social/' + knownMedia + '.png';
                }
            }
        });
    })();
};
