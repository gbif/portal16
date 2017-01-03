"use strict";
var Occurrence = require('../../../models/gbifdata/gbifdata').Occurrence,
    getAnnotation = require('../../../models/gbifdata/occurrence/occurrenceAnnotate'),
    _ = require('lodash');

function getFeedbackContentType(path, cb) {
    //parse path
    //if occurrence then get occurrence and dataset
    //if select list of annotatable datasets, then refer to their site.
    //else extract relevant contacts and list them.

    //if not occurrence then simply show github form in frontend
    var occurrenceRegEx = /^(\/)?occurrence\/[0-9]+$/gi;
    if (!!path.match(occurrenceRegEx)) {
        //is occurrence - extract id
        parseOccurrence(path, cb);
    } else {
        cb();
    }
}

function parseOccurrence(path, cb) {
    var occurrenceKey,
        contentType = {};

    occurrenceKey = path.match(/[0-9]+$/)[0];

    //get occurrence, dataset and pubisher based on occurrence key
    Occurrence.get(occurrenceKey,
        {
            expand: ['publisher', 'dataset']
        }
    ).then(
        function (occurrence) {
            // occurrence resolved

            // has custom annotation system?
            contentType.annotation = getAnnotation(occurrence.record);

            // get administrative contacts
            contentType.contacts = getContacts(occurrence);

            // add the feedback contenttype
            if (contentType.annotation) {
                contentType.type = 'CUSTOM';
            } else if (contentType.contacts) {
                contentType.type = 'MAIL';
            }

            contentType.datasetKey = occurrence.record.datasetKey;
            contentType.publishingOrgKey = occurrence.record.publishingOrgKey;

            cb(contentType);
        },
        function (err) {
            //failed to get occurrence. Fall back to gbif github report
            cb();
        }
    );
}

function getContacts(occurrence) {
    var contacts = _.get(occurrence, 'dataset.contacts', []),
        adminContacts = contacts.filter(function (contact) {
            return contact.type == 'ADMINISTRATIVE_POINT_OF_CONTACT' && !_.isEmpty(contact.email);
        });

    if (adminContacts.length > 0) {
        //get first contact name and mail
        var firstContact = {
            firstName: adminContacts[0].firstName,
            lastName: adminContacts[0].lastName,
            organization: adminContacts[0].organization,
            email: adminContacts[0].email[0]
        };

        //get list of administrative contact mails
        var allMails = [];
        adminContacts.forEach(function (e) {
            allMails = allMails.concat(e.email);
        });
        return {
            firstContact: firstContact,
            allMails: allMails
        }
    } else {
        return;
    }
}

module.exports = {
    getFeedbackContentType: getFeedbackContentType
};