"use strict";

let notifications = require('../notifications//notifications.model'),
    tests = require('./tests'),
    health = require('./health.model'),
    loadModel = require('./load.model'),
    resourceSearch = require('../resource/search/resourceSearch'),
    severity = require('./severity').severity,
    severityMap = require('./severity').severityMap,
    getMostSevere = require('./severity').getMostSevere,
    _ = require('lodash'),
    objectHash = require('object-hash'),
    NodeCache = require("node-cache"),
    healthCache = new NodeCache({stdTTL: 300, checkperiod: 60}),
    status = {};

module.exports = onComplete;

function onComplete() {
    return new Promise(function(resolve, reject){
        function check(){
            if (status.health && status.messages && status.load) {
                resolve(function(){return status;});
            } else {
                setTimeout(check, 2000);
            }
        }
        check();
    });
}
//start by updating status
update();
//after that update every 10 seconds
setInterval(function () {
    update();
}, 10000);

function update() {
    updateHealth();
    updateMessages();
    updateLoad();
}

function updateStatus(update) {
    status.health = update.health ? update.health : status.health;
    status.messages = update.messages ? update.messages : status.messages;
    status.load = update.load ? update.load : status.load;
    status.severity = getMostSevere(_.get(status, 'health.severity'), _.get(status, 'messages.severity'));

    //test for change
    status.hash = objectHash({
        health: status.health,
        messages: status.messages
    });
    status.updatedAt = (new Date()).toISOString();
}

async function updateMessages() {
    try {
        let timestamp = (new Date()).toISOString();
        let q = {contentType: 'notification', 'start': '*,' + timestamp, 'end': timestamp + ',*'};
        let options = {rawResponse: true};
        let messages = await resourceSearch.search(q, null, options);

        let messageStatus = messages.results.reduce(function (current, message) {
            return getMostSevere(message.severity, current);
        }, 'INFO');

        updateStatus({
            messages: {
                list: messages.results,
                severity: messageStatus
            }
        });
    } catch (err) {
        console.log(err);
        updateStatus({failure: err});
    }
}

function updateHealth() {
    function done(summary) {
        decorateWithHistory(summary)
            .then(function(data){
                updateStatus({health: data});
            })
            .catch(function(err){
                updateStatus({health: summary});
            });
        //updateStatus({health: summary});
    }

    function progress() {
        //ignore progress updates
    }

    function failed(err) {
        console.log('failed');
        console.log(err);
        updateStatus({failure: err});
    }

    health.start(tests, done, progress, failed);
}

async function updateLoad() {
    try {
        let load = await loadModel.start();
        updateStatus({
            load: load
        });
    } catch (err) {
        console.log(err);
        updateStatus({failure: err});
    }
}

async function decorateWithHistory(summaryHealth) {
    let mapped = await Promise.all(summaryHealth.components.map(function(e){return getWorstStateInInterval(e)}));
    let max = _.maxBy(mapped, function(o) { return severityMap[o.severity]; });
    return {
        components: mapped,
        severity: max.severity
    };
}

function getWorstStateInInterval(healthItem) {
    return new Promise(function(resolve, reject){
        try {
            if (severityMap[healthItem.severity] >= severityMap.WARNING) {
                healthCache.set(healthItem.component, healthItem, function (err, success) {
                    //doesn't matter to much that it fails. will just not remember that it is unstable and perhaps appear as healthy shortly after
                    resolve(healthItem);
                });
            } else {
                //if seemingly healthy, then test to see if that was also the case within the last 10 minutes. if not, then show a warning
                healthCache.get(healthItem.component, function (err, value) {
                    if (!err) {
                        if (value == undefined) {
                            // key not found, so the component has been healthy the last 10 minutes (unless cache empty due to restart)
                            resolve(healthItem);
                        } else {
                            //currently the endpoints is in a fine state, but it was in a bad state within the last 10 minutes
                            value.severity = severity.WARNING;
                            resolve(value);
                        }
                    }
                });
            }
        } catch(err){
            resolve(healthItem);
        }
    });
}