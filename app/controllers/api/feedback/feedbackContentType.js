'use strict';
let Occurrence = require('../../../models/gbifdata/gbifdata').Occurrence,
    Node = require('../../../models/gbifdata/gbifdata').Node,
    request = require('requestretry'),
    getAnnotations = require('../../../models/gbifdata/occurrence/occurrenceAnnotate'),
    localeFromQuery = require('../../../middleware/i18n/localeFromQuery'),
    locales = require('../../../../config/config').locales,
    _ = require('lodash');

function getFeedbackContentType(path, cb) {
    path = path || '';
    let queryLocale = localeFromQuery.getLocaleFromUrl(path, locales);
    path = localeFromQuery.removeLocaleFromUrl(path, queryLocale);
    // parse path
    // if occurrence then get occurrence and dataset
    // if select list of annotatable datasets, then refer to their site.
    // else extract relevant contacts and list them.

    // if not occurrence then simply show github form in frontend
    let occurrenceRegEx = /^(\/)?occurrence\/[0-9]+$/gi;
    if (path.match(occurrenceRegEx)) {
        // is occurrence - extract id
        parseOccurrence(path)
            .then(function(result) {
                cb(result);
            })
            .catch(function() {
                cb();// fail silently.
            });
    } else {
        cb();
    }
}

async function parseOccurrence(path) {
    let occurrenceKey,
        contentType = {};

    occurrenceKey = path.match(/[0-9]+$/)[0];

    // get occurrence, dataset and pubisher based on occurrence key
    let occurrence = await Occurrence.get(occurrenceKey,
        {
            expand: ['publisher', 'dataset']
        }
    );

    // get endorsing node as node managers want to be cc'ed
    let node = await Node.get(occurrence.publisher.endorsingNodeKey, {});
    contentType.ccContacts = getContacts(_.get(node, 'record.contacts', []));
    // has custom annotation system?
    occurrence.record._installationKey = occurrence.dataset.installationKey;
    contentType.annotation = getAnnotations(occurrence.record);

    if (contentType.annotation.commentsUrl) {
        let comments = await getComments(contentType.annotation);
        contentType.comments = comments;
    }

    // get administrative contacts
    contentType.contacts = getContacts(_.get(occurrence, 'dataset.contacts', []));

    // add the feedback contenttype
    if (contentType.annotation) {
        contentType.type = 'CUSTOM';
    } else if (contentType.contacts) {
        contentType.type = 'MAIL';
    }

    // add related keys to allow data providers to search for issues related to them
    contentType.datasetKey = occurrence.record.datasetKey;
    contentType.publishingOrgKey = occurrence.record.publishingOrgKey;

    return contentType;
}

// yet another awful hack to fit Annosys in.
async function getComments(config) {
    let options = {
        url: config.commentsUrl,
        json: true,
        maxAttempts: 1
    };

    let response = await request(options);
    if (response.statusCode == 200 && _.get(response, 'body.' + config.commentsCountField, 0) > 0) {
        let comments = {
            results: response.body[config.commentsListField],
            count: response.body[config.commentsCountField],
            url: config.allCommentsUrl
        };

        comments.results = _.map(_.slice(comments.results, 0, 5), function(comment) {
            let item = {
                title: comment[config.commentTitle],
                createdAt: comment[config.commentCreated]
            };
            let commentUrl = config.commentUrlTemplate;
            for (let i = 0; i < config.keys.length; i++) {
                let key = config.keys[i];
                let val = comment[key] || '';
                commentUrl = commentUrl.replace('{{' + key + '}}', val);
            }
            item.url = commentUrl;
            return item;
        });
        return comments;
    }
    return {
        count: 0,
        comments: []
    };
}

function getContacts(contacts) {
    let adminContacts = contacts.filter(function(contact) {
            return (contact.type == 'ADMINISTRATIVE_POINT_OF_CONTACT' || contact.type == 'NODE_MANAGER') && !_.isEmpty(contact.email);
        });

    if (adminContacts.length > 0) {
        // get first contact name and mail
        let firstContact = {
            firstName: adminContacts[0].firstName,
            lastName: adminContacts[0].lastName,
            organization: adminContacts[0].organization,
            email: adminContacts[0].email[0]
        };

        // get list of administrative contact mails
        let allMails = [];
        adminContacts.forEach(function(e) {
            allMails = allMails.concat(e.email);
        });
        return {
            firstContact: firstContact,
            allMails: allMails
        };
    } else {
        return;
    }
}

module.exports = {
    getFeedbackContentType: getFeedbackContentType
};
