"use strict";

var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    json2md = require('json2md'),
    authOperations = require('../../auth/gbifAuthRequest');

const DEFAULT_ENDORSING_NODE_KEY = rootRequire('config/config').publicConstantKeys.node.participantNodeManagersCommittee; // the GBiF secretariat


module.exports = {
    create: create
};

function create(body) {


    body.contacts.forEach((c) => {
        c.email = [c.email];
        if (c.phone) {
            c.phone = [c.phone];
        }
    });

    let org = {
        "endorsingNodeKey": (body.suggestedNodeKey === "other") ? DEFAULT_ENDORSING_NODE_KEY : body.suggestedNodeKey,
        "title": (body.title) ? body.title : "",
        "description": (body.description) ? body.description : "",
        "language": "ENGLISH",
        "email": (body.email) ? [body.email] : [],
        "phone": (body.phone) ? [body.phone] : [],
        "homepage": (body.homepage) ? [body.homepage] : [],
        "logoUrl": (body.logoUrl) ? body.logoUrl : "",
        "address": (body.address) ? [body.address] : [],
        "city": (body.city) ? body.city : "",
        "province": (body.province) ? body.province : "",
        "country": (body.country) ? body.country : "",
        "postalCode": (body.postalCode) ? body.postalCode : "",
        "latitude": (body.latitude) ? body.latitude : "",
        "longitude": (body.longitude) ? body.longitude : "",
        "contacts": body.contacts
    };


    let markdownJson = [];

    if (body.comments.isAssociatedWithGBIFfundedProject) {

        markdownJson.push({p: "Is associated with a GBIF-funded project: " + body.comments.isAssociatedWithGBIFfundedProject});

        if (body.comments.projectIdentifier) {
            markdownJson.push({p: "Project identifier: " + body.comments.projectIdentifier})
        }
        ;

    }
    ;

    if (body.comments.expectToPublishDataTypes) {
        markdownJson.push({p: "Expects to publish:"});
        markdownJson.push({
            ul: Object.keys(body.comments.expectToPublishDataTypes)
        });
    }

    if (body.comments.serverCapable) {
        markdownJson.push({p: "Will run a server which exposes data: " + body.comments.serverCapable})
    }
    if (body.comments.toolPlanned) {
        markdownJson.push({p: "Plans to run publishing software (e.g. an IPT): " + body.comments.toolPlanned})
    }

    if (body.comments.helpNeeded) {
        markdownJson.push({p: "Needs help for data publishing: " + body.comments.helpNeeded})
    }


    let options = {
        method: 'POST',
        body: org,
        url: apiConfig.publisherCreate.url,
        canonicalPath: apiConfig.publisherCreate.canonical
    };

    var newOrganistaionUUID;
    return authOperations.authenticatedRequest(options)
        .then((res) => {
            if (res.statusCode !== 201) {
                throw res;
            }

            let opts = {
                method: 'POST',
                body: {"content": json2md(markdownJson)},
                url: apiConfig.publisherCreate.url + res.body + "/comment",
                canonicalPath: apiConfig.publisherCreate.canonical + res.body + "/comment"

            };
            newOrganistaionUUID = res.body;
            return authOperations.authenticatedRequest(opts);
        })
        .then((commentResponse) => {

            if (commentResponse.statusCode !== 201 && typeof newOrganistaionUUID !== 'undefined') {
                throw commentResponse;
            }

            return newOrganistaionUUID;
        })


}