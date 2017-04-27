"use strict";
let _ = require('lodash');

module.exports = decorate;

function decorate(participant) {
    participant.headOfDelegation = _.find(participant.participant.people, {role: 'HEAD_OF_DELEGATION'});
    participant.nodeManager = _.find(participant.node.people, {role: 'NODE_MANAGER'});
    return participant;
}