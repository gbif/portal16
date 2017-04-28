/**
 For redirects to have pretty urls for menu items and selected items. Could also support legacy urls
 */
const redirectList = require('./redirectTable'),
    redirectTable = {},
    ignoreTrailingSlashes = true,
    querystring = require('querystring');

redirectList.forEach(function(e){
    redirectTable[e.incoming] = e.target;
});

function handleRedirects(req, res, next) {
    let redirectTo = redirectTable[req.path];
    if (!redirectTo && ignoreTrailingSlashes) {
        redirectTo = redirectTable[removeSlashes(req.path)];
    }
    if (redirectTo) {
        req.url = redirectTo + '?' + querystring.stringify(req.query);
        next();
    } else {
        next();
    }
}

function removeSlashes(str){
    return str.replace(/(\/)+$/,'');
}

module.exports = handleRedirects;
