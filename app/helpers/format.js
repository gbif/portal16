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
    return text.charAt(0) + text.slice(1).toLowerCase().replace(/_/g, ' ');
}

module.exports = {
    date: date,
    localizeInteger: localizeInteger,
    prettifyEnum: prettifyEnum
}
