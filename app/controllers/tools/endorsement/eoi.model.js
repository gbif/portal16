'use strict';

let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    json2md = require('json2md'),
    authOperations = require('../../auth/gbifAuthRequest');

const DEFAULT_ENDORSING_NODE_KEY = rootRequire('config/config')
    .publicConstantKeys.node.participantNodeManagersCommittee; // the GBiF secretariat

module.exports = {
    create: create
};

function sanitizeContacts(contacts) {
    contacts.forEach((c) => {
        if (!Array.isArray(c.email)) {
            c.email = [c.email];
        }
        c.email = c.email.filter((e) => {
            return e !== '';
        });

        if (c.phone) {
            if (!Array.isArray(c.phone)) {
                c.phone = [c.phone];
            }
            c.phone = c.phone.filter((e) => {
                return e !== '';
            });
        } else {
            // delete empty strings
            delete c.phone;
        }
    });
}

function create(body) {
    sanitizeContacts(body.contacts);
    let org = {
        endorsingNodeKey:
            body.suggestedNodeKey === 'other'
                ? DEFAULT_ENDORSING_NODE_KEY
                : body.suggestedNodeKey,
        title: body.title ? body.title : null,
        description: body.description ? body.description : null,
        language: 'ENGLISH',
        phone: body.phone ? [body.phone] : [],
        homepage: body.homepage ? [body.homepage] : [],
        logoUrl: body.logoUrl ? body.logoUrl : null,
        address: body.address ? [body.address] : [],
        city: body.city ? body.city : null,
        province: body.province ? body.province : null,
        country: body.country ? body.country : null,
        latitude: body.latitude ? body.latitude : null,
        longitude: body.longitude ? body.longitude : null,
        contacts: body.contacts
    };

    if (body.email) {
        org.email = [body.email];
    }

    if (body.postalCode) {
        org.postalCode = body.postalCode;
    }

    let markdownJson = [];

    if (body.comments.isAssociatedWithGBIFfundedProject) {
        markdownJson.push({
            p:
                'Is associated with a GBIF-funded project: ' +
                body.comments.isAssociatedWithGBIFfundedProject
        });

        if (body.comments.projectIdentifier) {
            markdownJson.push({
                p: 'Project identifier: ' + body.comments.projectIdentifier
            });
        }
    }

    if (body.comments.expectToPublishDataTypes) {
        markdownJson.push({p: 'Expects to publish:'});
        markdownJson.push({
            ul: Object.keys(body.comments.expectToPublishDataTypes)
        });
    }

    if (body.comments.expectedDataContent) {
        markdownJson.push({p: 'Expected data content:'});
        markdownJson.push({
            blockquote: body.comments.expectedDataContent
        });
    }

    if (body.comments.serverCapable) {
        markdownJson.push({
            p:
                'Will run a server which exposes data: ' +
                body.comments.serverCapable
        });
    }
    if (body.comments.toolPlanned) {
        markdownJson.push({
            p:
                'Plans to run publishing software (e.g. an IPT): ' +
                body.comments.toolPlanned
        });
    }

    if (body.comments.helpNeeded) {
        markdownJson.push({
            p: 'Needs help for data publishing: ' + body.comments.helpNeeded
        });
    }

    org.comments = [{content: json2md(markdownJson)}];

    let options = {
        method: 'POST',
        body: org,
        url: apiConfig.publisherCreate.url,
        canonicalPath: apiConfig.publisherCreate.canonical
    };
    return authOperations.authenticatedRequest(options).then((res) => {
        if (res.statusCode !== 201) {
            throw res;
        }

        return res.body;
    });
}
