var moment = require('moment'),
    defaultLanguage = 'en';

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
    text = text.substr(text.lastIndexOf('/')+1);
    return text.replace(/([A-Z][a-z])/g, ' $1').trim().replace(/_/g, ' ');
}

function getHighlightedText(text, desiredLength, isExtract) {
    isExtract = isExtract || false;
    var startTag = '<span class="gbifHl">',
        endTag = '<\/span>',
        replacedText = '',
        strippedText = '';
    if (typeof text === 'undefined' || text === null) {
        return strippedText;
    }
    replacedText = text.replace(/<em class="gbifHl">/, startTag).replace(/<\/em>/, endTag).replace(/<em class="gbifHl">/g, '').replace('</em>', '');
    strippedText = replacedText.replace(/<span class="gbifHl">/g, '').replace(/<\/span>/g, '');
    var start = Math.max(replacedText.indexOf(startTag), 0);
    var end = Math.min(replacedText.indexOf(endTag));

    if (strippedText.length < desiredLength) {
        return replacedText;
    }

    if (end < 0) {
        return strippedText.substr(0, desiredLength) + '...';
    }

    //if desired length above stripped length the return the replaced version


    //if not extract, then make sure the last tag is inside lenght before cropping
    if (!isExtract) {
        if (end - startTag.length > desiredLength) {
            //remove tags
            return strippedText.substr(0, desiredLength) + '...';
        }
        return replacedText.substr(0, desiredLength + startTag.length + endTag.length) + '...';
    }
    //if extract then crop across highlight. if not possible because highlight is too long, then remove highlight altogether
    if (end - start - startTag.length > desiredLength) {
        return '...' + strippedText.substr(start, desiredLength) + '...';
    }

    var croppedText = replacedText.substr(start-20, desiredLength+20 + startTag.length + endTag.length);
    if (start-20 > 0) croppedText = '...' + croppedText;
    if (start-20+desiredLength+20 + startTag.length + endTag.length<replacedText.length) croppedText += '...';
    return croppedText;
}

/**
 * @param bytes
 * @param decimals
 * @returns {*}
 * @see http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
 */
function formatBytes(bytes,decimals) {
    if(bytes == 0) return '0 Byte';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
module.exports = {
    date: date,
    localizeInteger: localizeInteger,
    prettifyEnum: prettifyEnum,
    getHighlightedText: getHighlightedText,
    formatBytes: formatBytes
}
