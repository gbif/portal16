let express = require('express'),
    router = express.Router(),
    cmsApi = require('../models/cmsData_deprecated/apiConfig'),
    cmsData = require('../models/cmsData_deprecated/cmsData'),
    cmsContents = require('../controllers/cms_deprecated/cmsContents.ctrl');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/:requestedPath(*)', (req, res, next) => {
    let jsonOutput = false;

    // If there is '.debug' then later output data as JSON
    if (req.params.requestedPath.search(/\.debug/) != -1) {
        req.params.requestedPath = req.params.requestedPath.replace('.debug', '');
        jsonOutput = true;
    }
    // Start by looking up URL Alias
    cmsData.cmsEndpointAccess(cmsApi.urlLookup.url + req.params.requestedPath)
        .then(body => {
            if (typeof body.data[0] === 'object' && typeof body.data[0].targetUrl === 'string') {
                // For generic type, proceed to rendering.
                if (body.data[0].type === 'generic') {
                    return cmsData.cmsEndpointAccess(cmsApi.generic.url + body.data[0].id)
                        .then(response => {
                            return cmsContents.renderPage(response, jsonOutput, res, req, next);
                        });
                }
                else {
                    let contentTypeUrlPrefix = (body.data[0].type === 'gbif_participant') ? body.data[0].type.replace('gbif_', '') : body.data[0].type.replace('_', '-');

                    // Only proceed to rendering if the requested path is identical to the target URL.
                    // Otherwise send a 307 redirection.
                    let redirectedUrl;
                    if (body.data[0].type === 'external') {
                        redirectedUrl = body.data[0].targetUrl;
                    }
                    else {
                        redirectedUrl = '/' + contentTypeUrlPrefix + '/' + body.data[0].targetUrl;
                    }
                    res.redirect(307, redirectedUrl);
                }
            }
            else {
                next();
            }
        })
        .catch(err => {
            next(err);
        });
});
