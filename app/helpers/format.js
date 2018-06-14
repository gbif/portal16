let moment = require('moment');
let sanitizeHtml = require('sanitize-html');
let Entities = require('html-entities').AllHtmlEntities;
let isUrl = require('is-url');
let entities = new Entities();
let camelCase = require('camelcase');
let _ = require('lodash');
let Humanize = require('humanize-plus');
let url = require('url');
let slug = require('slug');
let URLSearchParams = require('url').URLSearchParams;
let linkTools = require('./links/links');
let defaultLanguage = require('../../config/config').defaultLocale;
let localeConfig = require('../../config/locales');

// GBIF/UN date style
moment.updateLocale('en', {
    longDateFormat: {
        LT: 'k:mm',
        LTS: 'k:mm:ss',
        l: 'D-MMM-YYYY',
        L: 'DD-MMM-YYYY',
        ll: 'D MMMM YYYY',
        LL: 'D MMMM YYYY',
        lll: 'LT D MMMM YYYY',
        LLL: 'LT D MMMM YYYY',
        llll: 'LT, ddd D MMM YYYY',
        LLLL: 'LT, dddd Do MMMM YYYY'
    }
});
let dateFormats = ['YYYY-MM', 'YYYY-MM-DD k:mm:ss', 'ddd, DD MMM YYYY HH:mm:ss ZZ', 'ddd, DD MMM YY HH:mm:ss ZZ'];

function date(date, locale, format) {
    let day;
    locale = localeConfig.localeMappings.moment[locale] || defaultLanguage;
    format = _.isUndefined(format) ? 'LL' : format; // localized format http://momentjs.com/docs/#/displaying/format/
    if (!isNaN(Number(date))) {
        day = moment.unix(date).locale(locale);
    } else {
        day = moment(date, dateFormats).locale(locale);
    }
    return day.format(format);
}

function getSlug(str) {
    return slug(str.toLowerCase());
}

function dateRange(start, end, showHours, locale) {
    let startDate;
    let endDate;
    locale = localeConfig.localeMappings.moment[locale] || defaultLanguage;

    // parse start date
    if (!isNaN(Number(start))) {
        startDate = moment.unix(start).locale(locale);
    } else {
        startDate = moment(start, dateFormats).locale(locale);
    }

    // parse end date
    if (!isNaN(Number(end))) {
        endDate = moment.unix(end).locale(locale);
    } else {
        endDate = moment(end, dateFormats).locale(locale);
    }

    // always if all day event, then ignore time a day
    if (start === end || !end) {
        // if same date and time or no enddate then show just start date
        if (showHours) return startDate.format('D MMMM YYYY HH:mm');
        return startDate.format('D MMMM YYYY');
    } else if (showHours && startDate.format('D MMMM YYYY') === endDate.format('D MMMM YYYY')) {
        // if not an all day event, then show full date and time in interval
        // 15 may 2017 13:00 - 17 may 2017 20:00
        return startDate.format('D MMMM YYYY') + ' ' + startDate.format('HH:mm') + ' - ' + endDate.format('HH:mm');
    } else if (showHours) {
        // 10 april 13:30 - 15:50
        return startDate.format('D MMMM YYYY HH:mm') + ' - ' + endDate.format('D MMMM YYYY HH:mm');
    } else if (startDate.year() !== endDate.year()) {
        // 29 december 2017 - 1 january 2018
        return startDate.format('D MMM YYYY') + ' - ' + endDate.format('D MMM YYYY');
    } else if (startDate.month() !== endDate.month()) {
        // 29 juni - 2 july 2017
        return startDate.format('D MMM') + ' - ' + endDate.format('D MMM YYYY');
    } else if (startDate.day() !== endDate.day()) {
        // 17-19 may 2016
        return startDate.format('D') + ' - ' + endDate.format('D MMMM YYYY');
    } else {
        return startDate.format('D MMMM YYYY');
    }
}

function timeRange(start, end, locale) {
    let startDate;
    let endDate;
    locale = localeConfig.localeMappings.moment[locale] || defaultLanguage;

    // parse start date
    if (!isNaN(Number(start))) {
        startDate = moment.unix(start).locale(locale);
    } else {
        startDate = moment(start, dateFormats).locale(locale);
    }

    // parse end date
    if (!isNaN(Number(end))) {
        endDate = moment.unix(end).locale(locale);
    } else {
        endDate = moment(end, dateFormats).locale(locale);
    }

    // always if all day event, then ignore time a day
    if (start === end || !end) {
        // if same date and time or no enddate then show just start date
        return startDate.format('HH:mm');
    } else {
        return startDate.format('HH:mm') + ' - ' + endDate.format('HH:mm');
    }
}

function toCamelCase(text) {
    if (!_.isString(text)) {
        return '';
    }
    return camelCase(text);
}

function prettifyEnum(text) {
    if (typeof text === 'undefined' || text === null) {
        return '';
    }
    text = text.substr(text.lastIndexOf('/') + 1);
    return text.replace(/([A-Z][a-z])/g, ' $1').trim().replace(/_/g, ' ').toLowerCase();
}

function decodeHtml(text) {
    if (!_.isString(text)) {
        return '';
    }
    return entities.decode(text);
}

function encodeHtml(text) {
    if (!_.isString(text)) {
        return '';
    }
    return entities.encode(text);
}

function prettifyLicense(text) {
    if (!text) {
        return 'UNSPECIFIED';
    }
    let licenses = {
        'creativecommons.org/publicdomain/zero/1.0/legalcode': 'CC0_1_0',
        'creativecommons.org/licenses/by/4.0/legalcode': 'CC_BY_4_0',
        'creativecommons.org/licenses/by-nc/4.0/legalcode': 'CC_BY_NC_4_0'
    };
    let license = licenses[text.replace(/.*?:\/\//, '')];
    if (!license) {
        license = 'UNSUPPORTED';
    }
    return license;
}


/**
 * @param {number} bytes - A positive number of bytes
 * @param {number} decimals - How many decimals to show
 * @param {string} language - the two letter isocode
 * @return {string}
 * @see http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
 */
function formatBytes(bytes, decimals, language) {
    language = language ? language.substr(0, 2) : 'en';
    if (bytes === 0) return '0 Bytes';
    if (bytes === 1) return '1 Byte';
    let k = 1000;
    let dm = decimals || 0;
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toLocaleString(language) + ' ' + sizes[i];
}

function compactInteger(nr) {
    return Humanize.compactInteger(nr, 0);
}

function prefixLinkUrl(str, urlPrefix) {
    if (_.isString(str)) {
        str = str.replace(/^http(s)?:\/\/www\.gbif((-dev)|(-uat))?\.org/, '');
    }
    if (!isUrl(str) && _.startsWith(str, '/')) {
        str = urlPrefix + '/' + str.replace(/^\//, '');
    }
    return str;
}

function localizeLinks(dirty, urlPrefix) {
    urlPrefix = urlPrefix || '';
    dirty = dirty || '';
    return sanitizeHtml(dirty, {
            allowedTags: false,
            allowedAttributes: false,
            transformTags: {
                'a': function(tagName, attr) {
                    attr.href = prefixLinkUrl(attr.href, urlPrefix);
                    return {
                        tagName: 'a',
                        attribs: attr
                    };
                }
            }
        }
    );
}

function localizeLink(url, urlPrefix) {
    url = _.isString(url) ? url : '';
    urlPrefix = urlPrefix || '';
    url = prefixLinkUrl(url, urlPrefix);
    return url;
}

function sanitizeTrusted(dirty, urlPrefix) {
    dirty = dirty || '';
    urlPrefix = urlPrefix || '';
    let allowedTags = ['img', 'h2', 'iframe', 'span'];
    let clean;
    clean = sanitizeHtml(dirty, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(allowedTags),
            allowedAttributes: {
                '*': ['id', 'href', 'name', 'target', 'src', 'class', 'style', 'frameborder', 'width', 'height', 'allowfullscreen', 'gb-help', 'gb-help-options']
            },
            transformTags: {
                'a': function(tagName, attr) {
                    if (attr.href) {
                        attr.href = prefixLinkUrl(attr.href, urlPrefix);
                        let linkUrl = url.parse(attr.href);
                        let urlPathname = linkUrl.pathname;
                        let urlParams = new URLSearchParams(linkUrl.search);
                        if (urlPathname === '/faq' && urlParams.get('question') && urlParams.get('inline') === 'true') {
                            return {
                                tagName: 'span',
                                attribs: {
                                    'gb-help': urlParams.get('question')
                                }
                            };
                        } else {
                            return {
                                tagName: 'a',
                                attribs: attr
                            };
                        }
                    } else {
                        return {
                            tagName: 'a',
                            attribs: attr
                        };
                    }
                }

                // 'iframe': function (tagName, attr) {
                //    // My own custom magic goes here
                //    var innerElement = '<iframe src="' + attr.src + '"/>';
                //    var w = parseInt(attr.width),
                //        h = parseInt(attr.height);
                //    var ratio = w / h;
                //    return {
                //        tagName: 'div',
                //        attribs: {
                //            class: 'video-container',
                //            style: 'padding-bottom:60%'
                //        },
                //        text: innerElement
                //    };
                // }
            }
        }
    );
    return clean;
}

function removeHtml(dirty) {
    dirty = dirty || '';
    let clean = sanitizeHtml(dirty, {
            allowedTags: [],
            allowedAttributes: []
        }
    );
    return clean;
}

function sanitize(dirty, additionalAllowedTags) {
    dirty = dirty || '';
    let allowedTags = additionalAllowedTags ? ['img', 'h2'].concat(additionalAllowedTags) : ['img', 'h2'];
    let clean = sanitizeHtml(dirty, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(allowedTags),
            allowedAttributes: {
                '*': ['href', 'name', 'target', 'src', 'class', 'gb-help', 'gb-help-options']
            },
            exclusiveFilter: function(frame) {
                return frame.tag === 'p' && !frame.text.trim();
            }
        }
    );
    return clean;
}

function addPortalClasses(raw) {
    raw = raw || '';
    let clean;
    clean = sanitizeHtml(raw, {
            allowedTags: false,
            allowedAttributes: false,
            transformTags: {
                'table': sanitizeHtml.simpleTransform('table', {class: 'table'})
            }
        }
    );
    return clean;
}

function sanitizeField(obj, field) {
    _.set(obj, field, decodeHtml(removeHtml(_.get(obj, field))));
}

function sanitizeArrayField(array, field) {
    array.forEach(function(e) {
        sanitizeField(e, field);
    });
}

module.exports = {
    date: date,
    prettifyEnum: prettifyEnum,
    formatBytes: formatBytes,
    prettifyLicense: prettifyLicense,
    removeHtml: removeHtml,
    sanitize: sanitize,
    sanitizeTrusted: sanitizeTrusted,
    addPortalClasses: addPortalClasses,
    insertLinks: linkTools.insertLinks,
    linkify: linkTools.linkify,
    reduceUrlToDomain: linkTools.reduceUrlToDomain,
    getDOILink: linkTools.getDOILink,
    readableDOI: linkTools.readableDOI,
    toCamelCase: toCamelCase,
    decodeHtml: decodeHtml,
    encodeHtml: encodeHtml,
    compactInteger: compactInteger,
    dateRange: dateRange,
    timeRange: timeRange,
    localizeLinks: localizeLinks,
    localizeLink: localizeLink,
    sanitizeField: sanitizeField,
    sanitizeArrayField: sanitizeArrayField,
    getSlug: getSlug
};

