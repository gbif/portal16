'use strict';
var express = require('express'),
    router = express.Router(),
    cmsApi = require('../../../models/cmsData/apiConfig'),
    cmsData = require('../../../models/cmsData/cmsData');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/event/:requestedPath(*)', function(req, res, next) {
    // If there is '.debug' then later output data as JSON
    var requestedPath,
        jsonOutput = false;
    if (req.params.requestedPath.search(/\.debug/) != -1) {
        requestedPath = req.params.requestedPath.replace('.debug', '');
        jsonOutput = true;
    }
    else {
        requestedPath = req.params.requestedPath;
    }

    // Check whether parsed path is nid. If true, then skip URL alias lookup.
    if (!isNaN(requestedPath)) {
        cmsData.cmsEndpointAccess(cmsApi.event.url + requestedPath)
            .then(function(body){
                renderPage(body, jsonOutput);
            })
            .catch(function(err){
                next(err);
            });
    }
    // Start by looking up URL Alias
    else {
        cmsData.cmsEndpointAccess(cmsApi.urlLookup.url + requestedPath)
            .then(function(data){
                if (data.data.length == 1 && data.data[0].targetUrl == requestedPath) {
                    return data;
                }
                else {
                    throw new Error("No valid URL alias or it doesn't match.");
                }})
            .then(function(data){
                return cmsData.cmsEndpointAccess(cmsApi.event.url + data.data[0].id);
            })
            .then(function(body){
                renderPage(body, jsonOutput);
            })
            .catch(function(err){
                next(err);
            });
    }

    function renderPage(body, jsonOutput) {
        var proseContent = {
            data: body.data[0],
            images: body.data[0].images,
            self: body.self,
            _meta: {
                title: body.data[0].title,
                hasTools: true
            }
        };

        try {
            if (jsonOutput == true) {
                res.json(proseContent);
            } else {
                res.render('pages/about/event/event.nunjucks', proseContent);
            }
        } catch(e) {
            next(e);
        }
    }
});