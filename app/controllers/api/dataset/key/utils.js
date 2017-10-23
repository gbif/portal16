"use strict";
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    request = require('requestretry'),
    _ = require('lodash');

module.exports = {hasCrawlPermissions: hasCrawlPermissions};

async function checkPermissions(user, dataset, publishingOrg, hostingOrg, node) {
    return true;
}

async function hasCrawlPermissions(user, datasetKey){
    //if user has role xxx then allow crawl
    user.identifiers = {
        orcid: 'http://orcid.org/0000-0003-1691-239X'
    };
    //else check to see if listed as a contact with orcid or email
    let dataset = await getItem(apiConfig.dataset.url, datasetKey);
    if (isContact(dataset, user)) {
        return {
            hasCrawlPermissions: true
        };
    }
    let publisherPromise = getItem(apiConfig.publisher.url, dataset.publishingOrganizationKey, true);
    let hostingPromise = getItem(apiConfig.publisher.url, dataset.hostingOrganizationKey, true);
    let installationPromise = getItem(apiConfig.installation.url, dataset.installationKey, true);
    let nodePromise = getItem(apiConfig.country.url, dataset.country, true);
    let otherParties = await Promise.all([publisherPromise, installationPromise, nodePromise, hostingPromise]);
    return {
        hasCrawlPermissions: false
    };
}

async function getItem(endpoint, key, optional) {
    if (!key) {
        if (optional) return;
        throw new  Error('missing key in request');
    }
    let options = {
        method: 'GET',
        url: endpoint + key,
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode === 200 || (optional && response.statusCode === 404)) {
        return response.body;
    }
    throw response;
}

function isContact(item, user) {
    let contacts = _.get(item, 'contacts');
    let matchedContact = _.find(contacts, function(contact){
        return contact.email == user.email || contact.email.indexOf(user.email) > -1 || contact.userId == user.identifiers.orcid || contact.userId.indexOf(user.identifiers.orcid) > -1;
    });
    return matchedContact;
}