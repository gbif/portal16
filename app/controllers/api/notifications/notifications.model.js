'use strict';
let // resourceSearch = require('../../resource/key/resourceKey'),
    resourceSearch = require('../resource/search/resourceSearch'),
    resourceResultParser = require('../resource/search/resourceResultParser'),
    md = require('markdown-it')({html: true, linkify: false, typographer: false}),
    _ = require('lodash');

async function getNotifications(__) {
    let timestamp = (new Date()).toISOString();
    let q = {'contentType': 'notification', 'start': '*,' + timestamp, 'end': timestamp + ',*'};
    let options = {rawResponse: true};
    let resources = await resourceSearch.search(q, __, options);
    resourceResultParser.removeFields(resources.results, ['space', 'publishingOrganizationKey']);
    parseBody(resources.results);
    resources.results = stripFields(resources.results);
    return resources;
}


function parseBody(results) {
    results.forEach(function(e) {
        if (e.body) {
            _.set(e, 'body', md.render(e.body));
        }
    });
}

function stripFields(results) {
    return results.map(function(e) {
        return {
            title: e.title,
            body: e.body,
            url: e.url,
            notificationType: e.notificationType
        };
    });
}

module.exports = {
    getNotifications: getNotifications
};
