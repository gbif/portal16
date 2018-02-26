/**
 For redirects to have pretty urls for menu items and selected items. Could also support legacy urls
 */
const redirectList = rootRequire('config/redirects'),
    redirectTable = {},
    ignoreTrailingSlashes = true;

redirectList.forEach(function(e) {
    redirectTable[e.incoming] = e.target;
});

function handleRedirects(req, res, next) {
    let redirectTo = redirectTable[req.url];
    if (!redirectTo && ignoreTrailingSlashes ) {
        redirectTo = redirectTable[addTrailingSlash(req.url)];
    }

    if (redirectTo) {
        // let q = '';
        // if (!_.isEmpty(req.query)) {
        //     q = '?' + querystring.stringify(req.query);
        // }
        res.redirect(302, redirectTo);
    } else {
        next();
    }
}

// function removeSlashes(str) {
//     let parts = str.split('?');
//     let path = parts[0];
//
//     let query = (parts[1] !== undefined) ? '?'+parts[1] : '';
//     return path.replace(/(\/)+$/, '') + query;
// }

function addTrailingSlash(str) {
    let parts = str.split('?');
    let path = parts[0];
    let query = (parts[1] !== undefined) ? '?' + parts[1] : '';
    return path + '/' + query;
}


module.exports = handleRedirects;
