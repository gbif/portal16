"use strict";

let notificationsComplete = require('./notifications.model')(),
    severityHelper = require('./severity'),
    i18n = rootRequire('config/i18n'),
    objectHash = require('object-hash'),
    _ = require('lodash');

module.exports = {
    getHealth: getHealth
};

async function getHealth() {
    //get current health status
    let getStatus = await notificationsComplete;
    let status = _.cloneDeep(getStatus());

    //remove errors that aren't relevant to the portal
    delete status.load;
    //_.remove(status.health.components, {component: 'CRAWLER'});
    _.remove(status.health.components, {component: 'GITHUB'});

    //set severity to match the new object
    let max = _.maxBy(status.health.components, function(o) { return severityHelper.severityMap[o.severity]; });
    status.health.severity = max.severity;
    status.severity = severityHelper.getMostSevere(status.health.severity, status.messages.severity);

    //status.random = Math.random();
    //return status;
    return getNotifications(status);
}

function getNotifications(status) {
    var notifications = [].concat(_.get(status, 'messages.list', []));
    notifications = notifications.map(function(e){
        return _.pick(e, ['title', 'summary', 'url', 'severity']);
    });
    let healthSeverity = _.get(status, 'health.severity');
    if (healthSeverity !== 'OPERATIONAL') {
        notifications.push({
            title: i18n.__('health.notifications.' + healthSeverity + '.title'),
            summary: i18n.__('health.notifications.' + healthSeverity + '.summary'),
            severity: _.get(status, 'health.severity'),
            url: '/health'
        });
    }
    let results = {
        count: notifications.length,
        results: notifications,
        severity: status.severity
    };
    results.hash = objectHash(results);
    results.updatedAt = status.updatedAt;
    return results;
}

