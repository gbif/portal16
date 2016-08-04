var express = require('express'),
    router = express.Router(),
    cmsApi = require('../../../models/cmsData/apiConfig'),
    request = require('request');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/programme/:requestedPath(*)', function(req, res, next) {
    // Start by looking up URL Alias
    var requestedPath,
        jsonOutput = false;
    if (req.params.requestedPath.search(/\.debug/) != -1) {
        requestedPath = req.params.requestedPath.replace('.debug', '');
        jsonOutput = true;
    }
    else {
        requestedPath = req.params.requestedPath;
    }

    request(cmsApi.urlLookup.url + requestedPath, function(e, r, b) {
        b = JSON.parse(b);

        // Only proceed to rendering if there is a valid result returned from URL lookup.
        if (r.statusCode !== 200) {
            res.send('URL lookup failed.');
        }
        else if (Object.prototype.toString.call(b.data[0]) === '[object Object]' && b.data.length == 1) {

            // Only proceed to rendering if the requested path is identical to the target URL.
            // Otherwise send a 301 redirection.
            if (requestedPath == b.data[0].targetUrl) {
                var proseUrl = cmsApi.programme.url + b.data[0].id;
                request(proseUrl, function(error, response, body) {
                    body = JSON.parse(body);
                    var proseContent = {
                        data: body.data[0],
                        image: body.data[0].image,
                        self: body.self,
                        _meta: {
                            title: body.data[0].title,
                            hasTools: true
                        }
                    };
                    if (error) {
                        next(error);
                    }
                    else if (response.statusCode == 200){
                        try {
                            if (jsonOutput == true) {
                                res.json(proseContent);
                            } else {
                                res.render('pages/about/programme/programme.nunjucks', proseContent);
                            }

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
