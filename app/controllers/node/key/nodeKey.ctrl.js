"use strict";

var express = require('express'),
    utils = rootRequire('app/helpers/utils'),
    //apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    helper = rootRequire('app/models/util/util'),
    _ = require('lodash'),
    //contributors = require('../../dataset/key/contributors/contributors'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

//router.get('/node/:key\.:ext?', function (req, res, next) {
//    render(req, res, next, 'pages/node/key/nodeKey', true);
//});
//
//router.get('/node/:key/content\.:ext?', function (req, res, next) {
//    render(req, res, next, 'pages/node/key/nodeParticipantInfo', false);
//});
//
//router.get('/node/:key/contacts\.:ext?', function (req, res, next) {
//    render(req, res, next, 'pages/node/key/nodeParticipantContacts', false);
//});


let Participant = rootRequire('app/models/node/participant'),
    Node = rootRequire('app/models/node/node'),
    countries = rootRequire('app/models/util/country-codes'),
    countryMap = _.keyBy(_.filter(countries, 'ISO3166-1-Alpha-2'), 'ISO3166-1-Alpha-2'),
    participantView = require('./viewModel');

router.get('/node/:key\.:ext?', function (req, res, next) {
    try {
        let key = req.params.key;
        if (!utils.isGuid(key)) {
            next();
            return;
        }
        let node = Node.get(key, res.locals.gb.locales.current);

        node
            .then(function(participant){
                if (participant.participant.type == 'COUNTRY') {
                    res.redirect(302, res.locals.gb.locales.urlPrefix + '/country/' + participant.participant.countryCode);
                    return;
                }
                participant = participantView(participant);
                participant._meta = {
                    title: 'Node',
                    customUiView: true
                };
                helper.renderPage(req, res, next, participant, 'pages/participant/participant/participantKey');
            })
            .catch(function(err){
                next(err);
            });
    }catch(err){
        next(err);
    }
});

router.get('/country/:iso\.:ext?', function (req, res, next) {
    let isoCode = req.params.iso.toUpperCase();
    if (!countryMap[isoCode]) {
        next();
        return;
    }
    let participantPromise = Participant.get(isoCode, res.locals.gb.locales.current);
    participantPromise
        .then(function(participant){
            participant = participantView(participant);
            participant._meta = {
                title: 'Country',
                customUiView: true
            };
            helper.renderPage(req, res, next, participant, 'pages/participant/country/countryKey');
        })
        .catch(function(err){
            if (err.statusCode !== 404) {
                next(err);
                return;
            } else {
                let nonParticipant = {
                    country: {
                        countryCode: isoCode
                    }
                };
                nonParticipant._meta = {
                    title: countryMap[isoCode].name,
                    customUiView: true
                };
                helper.renderPage(req, res, next, nonParticipant, 'pages/participant/country/countryKey');
            }
        });
});
//
////
//router.get('/participant/:key\.:ext?', function (req, res, next) {
//    let key = req.params.key;
//    if (!key.match(/^[0-9]+$/)) {
//        next();
//        return;
//    }
//
//    let participantPromise = Participant.get(key, res.locals.gb.locales.current);
//    participantPromise
//        .then(function(participant){
//            participant = participantView(participant);
//            participant._meta = {
//                title: 'Participant',
//                customUiView: true
//            };
//            helper.renderPage(req, res, next, participant, 'pages/participant/participant/participantKey');
//        })
//        .catch(function(err){
//            next(err);
//        });
//});

//function render(req, res, next, template, redirect) {
//    var nodeKey = req.params.key;
//
//    if (!utils.isGuid(nodeKey)) {
//        next();
//    } else {
//
//        let baseRequest = {
//            url: apiConfig.node.url + nodeKey,
//            timeout: 30000,
//            method: 'GET',
//            json: true
//        };
//        request(baseRequest)
//            .then(function(record){
//                if (record.statusCode > 299) {
//                    next(record.message);
//                    return;
//                }
//
//                let node = {record: record.body};
//                transformNode(node);
//                //if node has a participant id from the direcotory then use that to resolve the drupal participant data
//                let identifiers = _.get(node.record, 'identifiers', []);
//                let identifier = _.find(identifiers, {type: 'GBIF_PARTICIPANT'});
//                let participantId = _.get(identifier, 'identifier');
//                if (typeof participantId !== 'undefined') {
//                    baseRequest.url = apiConfig.directoryParticipant.url + participantId;
//                    let participantDirectory = request(baseRequest),
//                        participantProse = resource.getParticipant(participantId, 2, false, res.locals.gb.locales.current);
//
//                    Promise.all([participantDirectory, participantProse])
//                        .then(function(values){
//                            if (values[0].statusCode > 299) {
//                                next('failed to get participant ' + participantId );
//                                return;
//                            }
//                            node.participantDirectory = values[0].body;
//                            node.participantProse = values[1];
//                            let pageData = {
//                                node: node,
//                                _meta: {
//                                    title: 'Node ' + node.record.title,
//                                    customUiView: true
//                                }
//                            };
//                            helper.renderPage(req, res, next, pageData, template);
//                        })
//                        .catch(function(err){next(err)});
//                } else {
//                    let pageData = {
//                        node: node,
//                        _meta: {
//                            title: 'Node ' + node.record.title,
//                            customUiView: true
//                        }
//                    };
//                    helper.renderPage(req, res, next, pageData, template);
//                }
//            })
//            .catch(function(err){
//                next(err);
//            });
//        return;
//        // Node.get(nodeKey, {expand: ['participant', 'directoryParticipant']}).then(function (node) {
//        //     try {
//        //         node.offset_endorsed = offset_endorsed || 0;
//        //         node.offset_datasets = offset_datasets || 0;
//        //         if (_.get(node, 'participant.errorType')) {
//        //             delete node.participant;
//        //         }
//        //         if (redirect && node.record.type === 'COUNTRY' && node.record.country) {
//        //             res.redirect('/country/' + node.record.country);
//        //         } else {
//        //             node._computedValues = {};
//        //
//        //             //create unified contacts with multiple roles per person
//        //             let contacts = node.record.contacts;
//        //             let nodeContact = {
//        //                 organization: node.record.title,
//        //                 city: node.record.city,
//        //                 country: node.record.country,
//        //                 address: node.record.address,
//        //                 email: node.record.email,
//        //                 phone: node.record.phone,
//        //                 postalCode: node.record.postalCode
//        //             };
//        //             contacts.push(nodeContact);
//        //
//        //             node._computedValues.contributors = contributors.getContributors(contacts);
//        //             //extract node manager and head of delegation
//        //             node._computedValues.nodeManager = node._computedValues.contributors.all.find(function (e) {
//        //                 return e.roles.indexOf('NODE_MANAGER') > -1;
//        //             });
//        //             node._computedValues.headOfDelegation = node._computedValues.contributors.all.find(function (e) {
//        //                 return e.roles.indexOf('HEAD_OF_DELEGATION') > -1;
//        //             });
//        //
//        //             //websites
//        //             var websites = _.uniq([].concat(_.get(node, 'record.homepage', [])).concat(_.get(node, 'directoryParticipant.participantUrl', [])));
//        //             node._computedValues.associatedWebsites = websites;
//        //             let pageData = {
//        //                 node: node,
//        //                 _meta: {
//        //                     title: 'Node ' + node.record.title,
//        //                     customUiView: true
//        //                 }
//        //             };
//        //             helper.renderPage(req, res, next, pageData, template);
//        //         }
//        //     } catch (err) {
//        //         next(err);
//        //     }
//        // }, function (err) {
//        //     next(err);
//        // });
//    }
//}

//function transformNode(node){
//    node._computedValues = {};
//
//    //create unified contacts with multiple roles per person
//    let contacts = node.record.contacts;
//    let nodeContact = {
//        organization: node.record.title,
//        city: node.record.city,
//        country: node.record.country,
//        address: node.record.address,
//        email: node.record.email,
//        phone: node.record.phone,
//        postalCode: node.record.postalCode
//    };
//    contacts.push(nodeContact);
//
//    node._computedValues.contributors = contributors.getContributors(contacts);
//    //extract node manager and head of delegation
//    node._computedValues.nodeManager = node._computedValues.contributors.all.find(function (e) {
//        return e.roles.indexOf('NODE_MANAGER') > -1;
//    });
//    node._computedValues.headOfDelegation = node._computedValues.contributors.all.find(function (e) {
//        return e.roles.indexOf('HEAD_OF_DELEGATION') > -1;
//    });
//
//    //websites
//    var websites = _.uniq([].concat(_.get(node, 'record.homepage', [])).concat(_.get(node, 'directoryParticipant.participantUrl', [])));
//    node._computedValues.associatedWebsites = websites;
//}