'use strict';

let request = rootRequire('app/helpers/request'),
    severity = require('./severity').severity,
    _ = require('lodash');

module.exports = {start: start};

let config = {
    url: 'http://www.contentfulstatus.com/history.json',
    component: 'CONTENTFUL',
    severity: severity.WARNING
};

function start(cb) {
    let options = {};
    options.method = 'GET';
    options.json = true;
    options.url = config.url;
    options.userAgent = 'GBIF_WEBSITE';
    options.maxAttempts = 3;
    options.timeout = 10000;

    request(options, function(err, response) {
        if (err || response.statusCode !== 200) {
            // ignore errors as it could be the endpoint and we have seen that the contentful status endpoint is fragile
            cb({
                severity: severity.OPERATIONAL,
                component: config.component
            });
        } else {
            let components = _.get(response, 'body.components', []);
            let deliveryAPI = _.find(components, {name: 'Content Delivery API'});
            if (deliveryAPI.status === 'operational' || deliveryAPI.status === 'degraded_performance' || deliveryAPI.status === 'under_maintenance' ) {
                cb({
                    severity: severity.OPERATIONAL,
                    component: config.component
                });
            } else {
                // options "operational" "under_maintenance" "degraded_performance" "partial_outage" "major_outage" "" - see https://developer.statuspage.io/#operation/patchPagesPageIdComponentsComponentId
                cb({
                    severity: severity.WARNING,
                    message: 'expected "Content Delivery API" status to be "operational" : ' + config.url,
                    component: config.component
                });
            }
        }
    });
}
