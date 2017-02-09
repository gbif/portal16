"use strict";
var Occurrence = require('../../../models/gbifdata/gbifdata').Occurrence,
    Node = require('../../../models/gbifdata/gbifdata').Node,
    getAnnotation = require('../../../models/gbifdata/occurrence/occurrenceAnnotate'),
    _ = require('lodash');

function getFeedbackContentType(path, cb) {
    path = path || '';
    //parse path
    //if occurrence then get occurrence and dataset
    //if select list of annotatable datasets, then refer to their site.
    //else extract relevant contacts and list them.

    //if not occurrence then simply show github form in frontend
    var occurrenceRegEx = /^(\/)?occurrence\/[0-9]+$/gi;
    if (path.match(occurrenceRegEx)) {
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

            //get endorsing node as node managers want to be cc'ed
            Node.get(occurrence.publisher.endorsingNodeKey, {}).then(function(node){
                contentType.ccContacts = getContacts(_.get(node, 'record.contacts', []));
                // has custom annotation system?
                contentType.annotation = getAnnotation(occurrence.record);

                // get administrative contacts
                contentType.contacts = getContacts(_.get(occurrence, 'dataset.contacts', []));

                // add the feedback contenttype
                if (contentType.annotation) {
                    contentType.type = 'CUSTOM';
                } else if (contentType.contacts) {
                    contentType.type = 'MAIL';
                }

                //add related keys to allow data providers to search for issues related to them
                contentType.datasetKey = occurrence.record.datasetKey;
                contentType.publishingOrgKey = occurrence.record.publishingOrgKey;

                cb(contentType);
            }, function(err){
                //fail silently. If there is no endorsing node or the call fails, then simply ignore it. It isn't essential for usage.
            });
        },
        function (err) {
            //failed to get occurrence. Fall back to gbif github report
            cb();
        }
    );
}

function getContacts(contacts) {
    var adminContacts = contacts.filter(function (contact) {
            return (contact.type == 'ADMINISTRATIVE_POINT_OF_CONTACT' || contact.type == 'NODE_MANAGER') && !_.isEmpty(contact.email);
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