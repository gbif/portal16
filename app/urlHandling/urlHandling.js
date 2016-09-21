var express = require('express'),
    router = express.Router(),
    cmsApi = require('../models/cmsData/apiConfig'),
    cmsData = require('../models/cmsData/cmsData');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/:requestedPath(*)', function(req, res, next) {
    // Start by looking up URL Alias
    cmsData.cmsEndpointAccess(cmsApi.urlLookup.url + req.params.requestedPath)
        .then(function(body){
            if (typeof body.data[0] == 'object' && typeof body.data[0].targetUrl == 'string') {

                var contentTypeUrlPrefix = (body.data[0].type == 'gbif_participant') ? body.data[0].type.replace('gbif_', '') : body.data[0].type.replace('_', '-');

                // Only proceed to rendering if the requested path is identical to the target URL.
                // Otherwise send a 301 redirection.
                var redirectedUrl;
                if (body.data[0].type == 'external') {
                    redirectedUrl = body.data[0].targetUrl;
                }
                else {
                    redirectedUrl = '/' + contentTypeUrlPrefix + '/' + body.data[0].targetUrl;
                }
                res.redirect(301, redirectedUrl);
            }
            else {
                throw new Error('URL Alias lookup exception with requestedPath.');
            }
        })
        .catch(function(err){
            next(err);
        });
});
