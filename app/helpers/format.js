var moment = require('moment'),
    sanitizeHtml = require('sanitize-html'),
    Entities = require('html-entities').AllHtmlEntities,
    entities = new Entities(),
    _ = require('lodash'),
    linkTools = require('./links/links'),
    defaultLanguage = 'en';

// GBIF/UN date style
moment.updateLocale('en', {
    longDateFormat: {
        LT: "k:mm",
        LTS: "k:mm:ss",
        l: "D-MMM-YYYY",
        L: "DD-MMM-YYYY",
        ll: "D MMMM YYYY",
        LL: "D MMMM YYYY",
        lll: "LT D MMMM YYYY",
        LLL: "LT D MMMM YYYY",
        llll: "LT, ddd D MMM YYYY",
        LLLL: "LT, dddd Do MMMM YYYY"
    }
});

function date(date, locale, format) {
    var day;
    locale = locale || defaultLanguage;
    format = format || 'LL'; // localized format http://momentjs.com/docs/#/displaying/format/
    if (!isNaN(Number(date))) {
        day = moment.unix(date).locale(locale);
    } else {
        day = moment(date, 'YYYY-MM-DD').locale(locale);
    }
    return day.format(format);
}

function localizeInteger(number, locale) {
    locale = locale || defaultLanguage;
    number = Number(number);
    if (isNaN(number)) return '';
    return new global.Intl.NumberFormat(locale).format(number);
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

function prettifyLicense(text) {
    if (!text) {
        return 'UNSPECIFIED';
    }
    let licenses = {
        "creativecommons.org/publicdomain/zero/1.0/legalcode": "CC0_1_0",
        "creativecommons.org/licenses/by/4.0/legalcode": "CC_BY_4_0",
        "creativecommons.org/licenses/by-nc/4.0/legalcode": "CC_BY_NC_4_0"
    };
    let license = licenses[text.replace(/.*?:\/\//, '')];
    if (!license) {
        license = 'UNSUPPORTED';
    }
    return license;
}


/**
 * @param bytes
 * @param decimals
 * @returns {*}
 * @see http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
 */
function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Byte';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function sanitizeTrusted(dirty) {
    dirty = dirty || '';
    var allowedTags = ['img', 'h2', 'iframe'];
    let clean = sanitizeHtml(dirty, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(allowedTags),
            allowedAttributes: {
                '*': ['href', 'name', 'target', 'src', 'class', 'style', 'frameborder', 'width', 'height', 'allowfullscreen']
            },
            exclusiveFilter: function (frame) {
                return frame.tag === 'p' && !frame.text.trim();
            }
            //transformTags: {
            //    'iframe': function (tagName, attr) {
            //        // My own custom magic goes here
            //        var innerElement = '<iframe src="' + attr.src + '"/>';
            //        var w = parseInt(attr.width),
            //            h = parseInt(attr.height);
            //        var ratio = w / h;
            //        return {
            //            tagName: 'div',
            //            attribs: {
            //                class: 'video-container',
            //                style: 'padding-bottom:60%'
            //            },
            //            text: innerElement
            //        };
            //    }
            //}
        }
    );
    return clean;
}

function sanitize(dirty, additionalAllowedTags) {
    dirty = dirty || '';
    var allowedTags = additionalAllowedTags ? ['img', 'h2'].concat(additionalAllowedTags) : ['img', 'h2'];
    let clean = sanitizeHtml(dirty, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(allowedTags),
            allowedAttributes: {
                '*': ['href', 'name', 'target', 'src', 'class']
            },
            exclusiveFilter: function (frame) {
                return frame.tag === 'p' && !frame.text.trim();
            }
        }
    );
    return clean;
}

function addPortalClasses(raw) {
    raw = raw || '';
    let clean = sanitizeHtml(raw, {
            allowedTags: false,
            allowedAttributes: {
                '*': ['href', 'name', 'target', 'src', 'class', 'frameborder', 'width', 'height', 'allowfullscreen']
            },
            transformTags: {
                'table': sanitizeHtml.simpleTransform('table', {class: 'table table-bordered table-striped'})
            }
        }
    );
    return clean;
}

module.exports = {
    date: date,
    localizeInteger: localizeInteger,
    prettifyEnum: prettifyEnum,
    formatBytes: formatBytes,
    prettifyLicense: prettifyLicense,
    sanitize: sanitize,
    sanitizeTrusted: sanitizeTrusted,
    addPortalClasses: addPortalClasses,
    insertLinks: linkTools.insertLinks,
    linkify: linkTools.linkify,
    getDOILink: linkTools.getDOILink,
    readableDOI: linkTools.readableDOI,
    decodeHtml: decodeHtml
};
