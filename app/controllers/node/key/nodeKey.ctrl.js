"use strict";

var express = require('express'),
    utils = rootRequire('app/helpers/utils'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    helper = rootRequire('app/models/util/util'),
    Node = require('../../../models/gbifdata/gbifdata').Node,
    resource = rootRequire('app/controllers/resource/key/resourceKey'),
    Q = require('q'),
    _ = require('lodash'),
    request = require('requestretry'),
    contributors = require('../../dataset/key/contributors/contributors'),
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
    var nodeKey = req.params.key;

    if (!utils.isGuid(nodeKey)) {
        next();
    } else {

        let baseRequest = {
            url: apiConfig.node.url + nodeKey,
            timeout: 30000,
            method: 'GET',
            json: true
        };
        request(baseRequest)
            .then(function(record){

                if (record.statusCode > 299) {
                    next(record.message);
                    return;
                }
                let node = {record: record.body};
                transformNode(node);
                //if node has a participant id from the direcotory then use that to resolve the drupal participant data
                let identifiers = _.get(node.record, 'identifiers', []);
                let identifier = _.find(identifiers, {type: 'GBIF_PARTICIPANT'});
                let participantId = _.get(identifier, 'identifier');
                if (typeof participantId !== 'undefined') {
                    baseRequest.url = apiConfig.directoryParticipant.url + participantId;
                    let participantDirectory = request(baseRequest),
                        participantProse = resource.getParticipant(participantId, 2, false, res.locals.gb.locales.current);

                    Promise.all([participantDirectory, participantProse])
                        .then(function(values){
                            if (values[0].statusCode > 299) {
                                next('failed to get participant ' + participantId );
                                return;
                            }
                            node.participantDirectory = values[0].body;
                            node.participantProse = values[1];
                            let pageData = {
                                node: node,
                                _meta: {
                                    title: 'Node ' + node.record.title,
                                    customUiView: true
                                }
                            };
                            helper.renderPage(req, res, next, pageData, template);
                        })
                        .catch(function(err){next(err)});
                }
            })
            .catch(function(err){
                res.status(500);
                res.send('The server failed to get that node');
            });
        return;
        // Node.get(nodeKey, {expand: ['participant', 'directoryParticipant']}).then(function (node) {
        //     try {
        //         node.offset_endorsed = offset_endorsed || 0;
        //         node.offset_datasets = offset_datasets || 0;
        //         if (_.get(node, 'participant.errorType')) {
        //             delete node.participant;
        //         }
        //         if (redirect && node.record.type === 'COUNTRY' && node.record.country) {
        //             res.redirect('/country/' + node.record.country);
        //         } else {
        //             node._computedValues = {};
        //
        //             //create unified contacts with multiple roles per person
        //             let contacts = node.record.contacts;
        //             let nodeContact = {
        //                 organization: node.record.title,
        //                 city: node.record.city,
        //                 country: node.record.country,
        //                 address: node.record.address,
        //                 email: node.record.email,
        //                 phone: node.record.phone,
        //                 postalCode: node.record.postalCode
        //             };
        //             contacts.push(nodeContact);
        //
        //             node._computedValues.contributors = contributors.getContributors(contacts);
        //             //extract node manager and head of delegation
        //             node._computedValues.nodeManager = node._computedValues.contributors.all.find(function (e) {
        //                 return e.roles.indexOf('NODE_MANAGER') > -1;
        //             });
        //             node._computedValues.headOfDelegation = node._computedValues.contributors.all.find(function (e) {
        //                 return e.roles.indexOf('HEAD_OF_DELEGATION') > -1;
        //             });
        //
        //             //websites
        //             var websites = _.uniq([].concat(_.get(node, 'record.homepage', [])).concat(_.get(node, 'directoryParticipant.participantUrl', [])));
        //             node._computedValues.associatedWebsites = websites;
        //             let pageData = {
        //                 node: node,
        //                 _meta: {
        //                     title: 'Node ' + node.record.title,
        //                     customUiView: true
        //                 }
        //             };
        //             helper.renderPage(req, res, next, pageData, template);
        //         }
        //     } catch (err) {
        //         next(err);
        //     }
        // }, function (err) {
        //     next(err);
        // });
    }
}

function transformNode(node){
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
}