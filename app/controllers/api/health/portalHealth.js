'use strict';

let notificationsComplete = require('./notifications.model')(),
    severityHelper = require('./severity'),
    objectHash = require('object-hash'),
    _ = require('lodash');

module.exports = {
    getHealth: getHealth
};

async function getHealth(__) {
    // get current health status
    let getStatus = await notificationsComplete;
    let status = _.cloneDeep(getStatus());

    // remove errors that aren't relevant to the portal
    delete status.load;

    // map components for quick look ups in the client
    status.components = {};
    status.health.components.forEach(function(e) {
        status.components[e.component] = e.severity;
    });

    // only judge portal health severity based on a subset of components, but include all statuses
    let portalRelevantComponents = _.filter(status.health.components, function(e) {
        return e.component !== 'CRAWLER' && e.component !== 'GITHUB';
    });
    // set severity to match the new object
    let max = _.maxBy(portalRelevantComponents, function(o) {
 return severityHelper.severityMap[o.severity];
});

    status.health.severity = max.severity;
    status.severity = severityHelper.getMostSevere(status.health.severity, status.messages.severity);

    return getNotifications(status, __);
}

function getNotifications(status, __) {
    let notifications = [].concat(_.get(status, 'messages.list', []));
    notifications = notifications.map(function(e) {
        return _.pick(e, ['title', 'summary', 'url', 'severity']);
    });
    let healthSeverity = _.get(status, 'health.severity');
    if (healthSeverity !== 'OPERATIONAL') {
        notifications.push({
            title: __('health.notifications.' + healthSeverity + '.title'),
            summary: __('health.notifications.' + healthSeverity + '.summary'),
            severity: _.get(status, 'health.severity'),
            url: '/health'
        });
    }
    let results = {
        count: notifications.length,
        results: notifications,
        severity: status.severity,
        components: status.components
    };
    results.hash = objectHash(results);
    results.updatedAt = status.updatedAt;
    return results;
}

