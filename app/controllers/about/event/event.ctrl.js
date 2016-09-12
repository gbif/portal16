'use strict';
var express = require('express'),
    router = express.Router(),
    cmsApi = require('../../../models/cmsData/apiConfig'),
    request = require('request'),
    helper = require('../../../models/util/util'),
    Q = require('q');

    module.exports = function (app) {
    app.use('/', router);
};

router.get('/event/:requestedPath(*)', function(req, res, next) {
    // If there is '.debug' then later output pre-renderred data as JSON
    var requestedPath,
        jsonOutput = false;
    if (req.params.requestedPath.search(/\.debug/) != -1) {
        requestedPath = req.params.requestedPath.replace('.debug', '');
        jsonOutput = true;
    }
    else {
        requestedPath = req.params.requestedPath;
    }

    // Start by looking up URL Alias
    cmsEndpointAccess(cmsApi.urlLookup.url + requestedPath)
        .then(function(data){
            if (data.data.length == 1 && data.data[0].targetUrl == requestedPath) {
                return data;
            }
            else {
                throw new error();
            }})
        .then(function(data){
            return cmsEndpointAccess(cmsApi.event.url + data.data[0].id);
        })
        .then(function(body){
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
        })
        .catch(function(err){
            next(err);
        });
    });

function cmsEndpointAccess(path) {
    var deferred = Q.defer();
    helper.getApiData(path, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(new Error(err));
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error(err));
        }
    });
    return deferred.promise;
}