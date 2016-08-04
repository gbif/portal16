var express = require('express'),
    router = express.Router(),
    cmsApi = require('../models/cmsData/apiConfig'),
    request = require('request');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/:requestedPath(*)', function(req, res, next) {
    // Start by looking up URL Alias
    request(cmsApi.urlLookup.url + req.params.requestedPath, function(e, r, b) {
        // @todo better error handling when CMS API endpoint is not available.
        try {
            b = JSON.parse(b);
            // Only proceed to rendering if there is a valid result returned from URL lookup.
            if (r.statusCode !== 200) {
                res.send('URL lookup failed.');
            }
            else if (Object.prototype.toString.call(b.data[0]) === '[object Object]' && b.data.length == 1) {
                var type = '';

                switch (b.data[0].type) {
                    case 'news':
                        type = 'news';
                        break;
                    case 'data_use':
                        type = 'data-use';
                        break;
                    case 'event':
                        type = 'event';
                        break;
                    case 'resource':
                        type = 'resource';
                        break;
                    case 'gbif_participant':
                        type = 'participant';
                        break;
                    case 'page':
                        type = 'page';
                        break;
                    case 'programme':
                        type = 'programme';
                        break;
                    case 'project':
                        type = 'project';
                        break;
                    case 'external':
                        type = 'external';
                        break;
                }

                // Only proceed to rendering if the requested path is identical to the target URL.
                // Otherwise send a 301 redirection.
                var redirectedUrl;
                if (type == 'external') {
                    redirectedUrl = b.data[0].targetUrl;
                }
                else {
                    redirectedUrl = '/' + type + '/' + b.data[0].targetUrl;
                }
                res.redirect(301, redirectedUrl);
            }
            else {
                next();
            }
        } catch (e) {
            next(e);
        }



    });

});
