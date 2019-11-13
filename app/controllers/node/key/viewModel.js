'use strict';
let _ = require('lodash');

module.exports = decorate;

function decorate(participant) {
    let participantPeople = _.get(participant, 'participant.people', []);
    let nodePeople = _.get(participant, 'node.people', []);
    participant.headOfDelegation = _.find(participantPeople, {role: 'HEAD_OF_DELEGATION'});
    participant.nodeManager = _.find(nodePeople, {role: 'NODE_MANAGER'});

    // is the participant an active one?
    let participationStatus = _.get(participant, 'participant.participationStatus');
    let acceptedParticipationStates = ['VOTING', 'ASSOCIATE', 'AFFILIATE'];
    let isActiveParticipant = acceptedParticipationStates.indexOf(participationStatus) > -1;
    participant.isActiveParticipant = isActiveParticipant;

    let activeRelations = _.concat([], participantPeople, nodePeople);

    let activePeople = getOrderedListOfPeople(activeRelations, participant.contacts);
    activePeople.forEach((x) => {
        x.country = x.countryCode;
    });
    participant.activePeople = activePeople;
    // decorate people with
    return participant;
}

/**
 * return a ordered list of people and their roles (and when) - could be filtered first on fx active
 * @param relations
 */
function getOrderedListOfPeople(relations, allContacts) {
    let contacts = _.clone(allContacts),
        people;
    if (!contacts) {
        return [];
    }
    // add relation to contacts
    relations.forEach(function(relation) {
        let person = contacts[relation.personId];
        person._sortOrder = person._sortOrder || 0;
        person.roles = person.roles || [];
        person.roles.push(relation);
        if (relation.role == 'NODE_MANAGER') person._sortOrder += 1;
        if (relation.role == 'HEAD_OF_DELEGATION') person._sortOrder += 2;
    });

    let peopleIds = _.union(_.map(relations, 'personId'), 'personId');
    people = _.map(peopleIds, function(e) {
        return contacts[e];
    });
    people = _.orderBy(people, ['_sortOrder'], ['desc']);

    return people;
}
