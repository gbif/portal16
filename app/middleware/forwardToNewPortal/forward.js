let removeLocaleFromUrl = require('../i18n/localeFromQuery').removeLocaleFromUrl;
let config = rootRequire('config/config');

const allowedRedirects = new Set(['tools', 'derived-dataset', 'api', 'js', 'templates']);

function forward(req, res, next) {
    // remove query params from url first
    let splitted = req.url.split('?');
    let url = splitted[0];
    let params = splitted[1];
    let redirectTo;
    let localeStrippedUrl = removeLocaleFromUrl(url);
    if (!allowedRedirects.has(localeStrippedUrl.split('/')[1]) ) {
        redirectTo = config.newGbifOrg + url + (params ? '?' + params : '');
    }
   // console.log('Forwarding request from', req.url, 'to', redirectTo);

    if (redirectTo) {
        
        res.redirect(302, redirectTo);
    } else {
        next();
    }
}

module.exports = forward;