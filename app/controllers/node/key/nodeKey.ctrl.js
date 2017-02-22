"use strict";

var express = require('express'),
    utils = rootRequire('app/helpers/utils'),
    helper = rootRequire('app/models/util/util'),
    Node = require('../../../models/gbifdata/gbifdata').Node,
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    contributors = require('../../dataset/key/contributors/contributors'),
    isDev = rootRequire('config/config').env == 'dev',
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/node/:key\.:ext?', function (req, res, next) {
    var nodeKey = req.params.key;
    if (!utils.isGuid(nodeKey)) {
        next();
    } else {
        Node.get(nodeKey).then(function (node) {
            if (node.record.type === 'COUNTRY' && node.record.country) {
                res.redirect('/country/' + node.record.country);
            } else {
                if (!isDev) {
                    next();
                    return;
                }
                node._computedValues = {};
                let contacts = node.record.contacts;
                let nodeContact = {
                    organization: node.record.title,
                    city: node.record.city,
                    country: node.record.country,
                    address: node.record.address,
                    email: node.record.email,
                    phone: node.record.phone,
                    postalCode: node.record.postalCode
                };
                contacts.push(nodeContact);

                node._computedValues.contributors = contributors.getContributors(contacts);
                let pageData = {
                    node: node,
                    _meta: {
                        title: 'Node ' + node.record.title
                    }
                };
                helper.renderPage(req, res, next, pageData, 'pages/node/key/nodeKey');
            }
        }, function(err){
           next(err);
        });
    }
});