var moment = require('moment'),
    sanitizeHtml = require('sanitize-html'),
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
    locale = locale || defaultLanguage;
    format = format || 'LL'; // localized format http://momentjs.com/docs/#/displaying/format/
    var day = moment(date).locale(locale);
    if (!isNaN(Number(date))) day = moment.unix(date).locale(locale);
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

function sanitize(dirty) {
    dirty = dirty || '';
    let clean = sanitizeHtml(dirty, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h2']),
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
                '*': [ 'href', 'name', 'target', 'src', 'class' ]
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
    addPortalClasses: addPortalClasses
};
