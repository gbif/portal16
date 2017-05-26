"use strict";

let Publisher = require('../../../../models/gbifdata/gbifdata').Publisher,
    contributors = require('../../../dataset/key/contributors/contributors');

async function getPublisher(key) {
    let publisher = await Publisher.get(key, {expand: ['endorsingNode', 'datasets', 'occurrences', 'installation']});
    publisher._computedValues = {};
    let contacts = publisher.record.contacts;
    let organizationContact = {
        organization: publisher.record.title,
        city: publisher.record.city,
        country: publisher.record.country,
        address: publisher.record.address,
        province: publisher.record.province,
        email: publisher.record.email,
        postalCode: publisher.record.postalCode
    };
    if (organizationContact.address || organizationContact.email) {
        contacts.push(organizationContact);
    }
    publisher._computedValues.contributors = contributors.getContributors(contacts);
    return publisher;
}

module.exports = {
    getPublisher: getPublisher
};