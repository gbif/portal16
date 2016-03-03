function getLocaleFromUrl(url, locales) {
    if (url == '') {
        return false;
    }
    var first = url.substring(1).split('/');
    var matchedIndex = locales.indexOf(first[0]);
    if (matchedIndex != -1) {
        return locales[matchedIndex];
    }
    return false;
}

function removeLocaleFromUrl(url, locale) {
    var expr = '(^' + locale + '\/)|(^' + locale + '$)';
    var regex = new RegExp(expr);
    var strippedUrl = '/' + url.substring(1).replace(regex, '');
    return strippedUrl;
}

module.exports = function(app, locales, defaultLocale) {

    //Use middleware to set current language based on url
    app.use(function (req, res, next) {
        var locale = getLocaleFromUrl(req.url, locales);
        if (locale) {
            req.url = removeLocaleFromUrl(req.url, locale);
            req.setLocale(locale);
        } else {
            req.setLocale(defaultLocale); // remove to use browser preference
        }
        next();
    });

};

