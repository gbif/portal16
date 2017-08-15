/**
 For redirects to have pretty urls for menu items and selected items. Could also support legacy urls
 */
const redirectList = rootRequire('config/redirects'),
    redirectTable = {},
    _ = require('lodash'),
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
        let q = '';
        if (!_.isEmpty(req.query)) {
            q = '?' + querystring.stringify(req.query);
        }
        res.redirect(302, redirectTo + q);
    } else {
        next();
    }
}

function removeSlashes(str){
    return str.replace(/(\/)+$/,'');
}


module.exports = handleRedirects;
