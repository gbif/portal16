var express = require('express'),
    router = express.Router(),
    cmsApi = require('../../../models/cmsdata/apiConfig'),
    request = require('request');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/data-use/:requestedPath(*)', function(req, res, next) {
    // Start by looking up URL Alias
    request(cmsApi.urlLookup.url + req.params.requestedPath, function(e, r, b) {
        b = JSON.parse(b);

        // Only proceed to rendering if there is a valid result returned from URL lookup.
        if (r.statusCode !== 200) {
            res.send('URL lookup failed.');
        }
        else if (Object.prototype.toString.call(b.data[0]) === '[object Object]' && b.data.length == 1) {

            // Only proceed to rendering if the requested path is identical to the target URL.
            // Otherwise send a 301 redirection.
            if (req.params.requestedPath == b.data[0].targetUrl) {
                var proseUrl = cmsApi.dataUse.url + b.data[0].id;
                request(proseUrl, function(error, response, body) {
                    if (error) {
                        next(error);
                    }
                    else if (response.statusCode == 200){
                        try {
                            body = JSON.parse(body);
                            res.render('pages/about/data-use/data-use.nunjucks', {
                                data: body.data[0],
                                images: body.data[0].images,
                                self: body.self,
                                _meta: {
                                    title: body.data[0].title,
                                    hasTools: true
                                }
                            });
                        } catch(e) {
                            next(e);
                        }
                    }
                    else if (400 <= response.statusCode && response.statusCode < 500) {
                        next();
                    } else {
                        next({
                            status: response.statusCode,
                            message: 'Something went wrong while trying to display data use item: ' + req.params.key
                        });
                    }
                });
            }
            else {
                next();
            }
        }
        else {
            next();
        }

    });

});
