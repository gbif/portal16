"use strict";

var express = require('express'),
    utils = rootRequire('app/helpers/utils'),
    helper = rootRequire('app/models/util/util'),
    Node = require('../../../models/gbifdata/gbifdata').Node,
    _ = require('lodash'),
    contributors = require('../../dataset/key/contributors/contributors'),
    isDev = rootRequire('config/config').env == 'dev',
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/node/:key\.:ext?', function (req, res, next) {
    render(req, res, next, 'pages/node/key/nodeKey', true);
});

router.get('/node/:key/content\.:ext?', function (req, res, next) {
    render(req, res, next, 'pages/node/key/nodeParticipantInfo', false);
});

router.get('/node/:key/contacts\.:ext?', function (req, res, next) {
    render(req, res, next, 'pages/node/key/nodeParticipantContacts', false);
});

function render(req, res, next, template, redirect) {
    var nodeKey = req.params.key,
        offset_endorsed = req.query.offset_endorsed,
        offset_datasets = req.query.offset_datasets;
    if (!utils.isGuid(nodeKey)) {
        next();
    } else {
        Node.get(nodeKey, {expand: ['participant', 'directoryParticipant']}).then(function (node) {
            try {
                node.offset_endorsed = offset_endorsed || 0;
                node.offset_datasets = offset_datasets || 0;
                if (_.get(node, 'participant.errorType')) {
                    delete node.participant;
                }
                if (redirect && node.record.type === 'COUNTRY' && node.record.country) {
                    res.redirect('/country/' + node.record.country);
                } else {
                    node._computedValues = {};

                    //create unified contacts with multiple roles per person
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
                    //extract node manager and head of delegation
                    node._computedValues.nodeManager = node._computedValues.contributors.all.find(function (e) {
                        return e.roles.indexOf('NODE_MANAGER') > -1;
                    });
                    node._computedValues.headOfDelegation = node._computedValues.contributors.all.find(function (e) {
                        return e.roles.indexOf('HEAD_OF_DELEGATION') > -1;
                    });

                    //websites
                    var websites = _.uniq([].concat(_.get(node, 'record.homepage', [])).concat(_.get(node, 'directoryParticipant.participantUrl', [])));
                    node._computedValues.associatedWebsites = websites;
                    let pageData = {
                        node: node,
                        _meta: {
                            title: 'Node ' + node.record.title,
                            customUiView: true
                        }
                    };
                    helper.renderPage(req, res, next, pageData, template);
                }
            } catch (err) {
                next(err);
            }
        }, function (err) {
            next(err);
        });
    }
}