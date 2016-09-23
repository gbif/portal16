"use strict";
var _ = require('lodash');

/**
 * The same person can appear multiple times in the list of dataset contacts
 * OrcIds and mail address is considered primary identifiers. If no such is provided, people will be grouped based on their first and last name. And if no name, then on organization.
 * Downside: two different people with the same name, where neither have an email address or an userId (orcId) will appear as one (despite organisation could possible separate them).
 * @param contact
 */
function getContactIdentifiers(contact) {
    let identifiers = [];
    if (_.isArray(contact.userId) ) {
        identifiers = identifiers.concat(contact.userId);
    }
    if (contact.email) {
        identifiers = identifiers.concat(contact.email);
    }
    if (identifiers.length == 0) {
        if (contact.firstName && contact.lastName) {
            identifiers.push(contact.firstName + ' ' + contact.lastName)
        } else if (contact.organization) {
            identifiers.push(contact.organization);
        }
    }

    return identifiers;
}

/**
 * Remove contacts that have too little information to be useful. A contact is considered incomplete if there is no identification means (see function getContactIdentifiers)
 * @param contacts
 * @returns {*}
 */
function removeContactsWithoutIdentifier(contacts) {
    return contacts.filter(function(e){
       return  getContactIdentifiers(e).length > 0;
    });
}

/**
 * two contacts are the same if they share an identifier
 * @param a
 * @param b
 * @returns {boolean}
 */
function isSameAuthor(a, b) {
    let identifierA = getContactIdentifiers(a),
        identifierB = getContactIdentifiers(b);
    for (var i = 0; i < identifierA.length; i++) {
        if (identifierB.indexOf(identifierA[i]) > -1) {
            return true;
        }
    }
    return false;
}

/**
 * Currently a very careful extend without the risk of merging to persons too much. In case of a wrong match or scathered info across several entries, information will get lost.
 * Merging with oneself should not change anything
 * @param a
 * @param b
 * @returns the extended contact (NOT a copy)
 */
function extendContact(a, b) {
    a.primary = a.primary || b.primary;
    if (!a.roles) {
        a.roles = [a.type];
    }
    a.roles = _.union(a.roles, [b.type]);
    return a;
}

/**
 * remove duplicates, considering the first apperance the primary if there is differences. the first apperance is extended using function extendContact()
 * @param contacts
 * @returns {Array} new array withhout duplicates and contacts with insufficient info
 */
function getUniqueContacts(contacts) {
    if (!_.isArray(contacts)) {
        return [];
    }
    let trimmedContacts = removeContactsWithoutIdentifier(contacts),
        mergedContacts = [];

    trimmedContacts.forEach(function(e){
        let index = indexInList(mergedContacts, e);
        if (index > -1) {
            //merge
            extendContact(mergedContacts[index], e);
        } else {
            //add
            let cloned = _.cloneDeep(e);
            if (!cloned.roles) {
                cloned.roles = [cloned.type];
            }
            mergedContacts.push(cloned);
        }
    });
    return mergedContacts;
}

/**
 * get index of that contact in the list. compared using their identifiers
 * @param list
 * @param contact
 * @returns {number}
 */
function indexInList(list, contact) {
    for (var i = 0; i < list.length; i++) {
        if ( isSameAuthor(list[i], contact)) {
            return i;
        }
    }
    return -1;
}


function cleanContacts(contacts) {
    //remove contacts with insuffient contact details
    let trimmedContacts = removeContactsWithoutIdentifier(contacts);

    //assign IDs based on their identifiers
    let ids = [];
    trimmedContacts.forEach(function(e){
       let i = indexInList(ids, e);
        if (i == -1) {
            //new contact found - assign new ID
            e._id = ids.length;
            ids.push(e);
        } else {
            //that contact has been seen before. assign existing ID
            e._id = i;
        }
    });

    //remove duplicates (same person same role shouldn't appear twice)
    trimmedContacts = _.uniqWith(trimmedContacts, function(a, b){
        return a.type == b.type && a._id == b._id;
    });

    return trimmedContacts;
}

function getRoleOrder(roles) {
    if (roles.indexOf('ORIGINATOR') != -1) {
        return 0;
    } else if (roles.indexOf('METADATA_AUTHOR') != -1) {
        return 1;
    } else if (roles.indexOf('ADMINISTRATIVE_POINT_OF_CONTACT') != -1) {
        return 3;
    } else {
        return 2;
    }
}

function getFirstWithEmail(contacts) {
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].email.length > 0) {
            return contacts[i];
        }
    }
    return false;
}

function getCitationOrder(contacts) {
    if (!_.isArray(contacts)) {
        return [];
    }
    let originators, administrativeContacts, uniqueContacts, trimmedContacts = cleanContacts(contacts);
    trimmedContacts = trimmedContacts.filter(function(e){
       return e.firstName || e.lastName;
    });
    originators = trimmedContacts.filter(function(e){
        return e.type == 'ORIGINATOR';
    });
    administrativeContacts = trimmedContacts.filter(function(e){
        return e.type == 'ADMINISTRATIVE_POINT_OF_CONTACT' && indexInList(originators, e) == -1;
    });

    //get unique
    uniqueContacts = getUniqueContacts(trimmedContacts);
    //sort based on role, then order the are delivered in
    uniqueContacts.sort(function(a, b){
        let x = getRoleOrder(a.roles) - getRoleOrder(b.roles);
        return x == 0 ? a._id - b._id : x;
    });
    //mark contacts that are to be highlighted in header
    uniqueContacts.forEach(function(e){
       if ( _.intersection(e.roles, ['ORIGINATOR', 'ADMINISTRATIVE_POINT_OF_CONTACT', 'METADATA_AUTHOR']).length > 0 ) {
           e._highlighted = true;
       }
    });

    //assign primary contact
    let primaryContact = getFirstWithEmail(administrativeContacts);

    if (!primaryContact) {
        primaryContact = getFirstWithEmail(uniqueContacts);
    } else {
        primaryContact = uniqueContacts.find(function(e){
            return isSameAuthor(e, primaryContact);
        });
    }
    if (primaryContact) {
        primaryContact._primaryContact = true;
    }

    return {
        contributers: uniqueContacts,
        citedContributers: uniqueContacts.filter(function(e){
            return e._highlighted;
        })
    };
}

module.exports = {
    getCitationOrder: getCitationOrder,
    getContactIdentifiers: getContactIdentifiers,
    getUniqueContacts: getUniqueContacts
};

