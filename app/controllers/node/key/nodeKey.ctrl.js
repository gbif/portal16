"use strict";

var express = require('express'),
    utils = rootRequire('app/helpers/utils'),
    helper = rootRequire('app/models/util/util'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    contributors = require('../../dataset/key/contributors/contributors'),
    isDev = rootRequire('config/config').env == 'dev',
    Q = require('q'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/node/:key\.:ext?', function (req, res, next) {
    var nodeKey = req.params.key;
    if (!utils.isGuid(nodeKey)) {
        next();
    } else {
        nodeSearch(nodeKey).then(function(node) {
            if (node.record.type === 'COUNTRY' && node.record.country) {
                res.redirect('/country/' + node.record.country);
            } else {
                if (!isDev) {
                    next();
                    return;
                }
                node._computedValues = {};
                let contacts = node.record.contacts;
                //let organizationContact = {
                //    organization: publisher.record.title,
                //    city: publisher.record.city,
                //    country: publisher.record.country,
                //    address: publisher.record.address,
                //    postalCode: publisher.record.postalCode,
                //    type: 'PUBLISHER'
                //};
                //contacts.push(organizationContact);

                node._computedValues.contributors = contributors.getContributors(contacts);
                let pageData = {
                    node: node,
                    _meta: {
                        title: 'Node ' + node.record.title
                    }
                };
                renderPage(req, res, next, pageData, 'pages/node/key/nodeKey');
            }
        }, function(err){
           next(err);
        });
    }
});

function nodeSearch(key) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(apiConfig.node.url + key, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve({record: data});
        }
        else {
            deferred.reject(err);
        }
    }, {retries: 2, timeoutMilliSeconds: 30000});
    return deferred.promise;
}

function renderPage(req, res, next, data, template) {
    try {
        if (req.params.ext == 'debug') {
            res.json(data);
        } else {
            res.render(template, data);
        }
    } catch (e) {
        next(e);
    }
}