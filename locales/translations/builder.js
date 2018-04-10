module.exports = builder;

function builder(locale) {
    locale = locale || 'en';
    let translations = require(`../server/${locale}`);
    return translations;
}
