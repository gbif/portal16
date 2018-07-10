'use strict';

let // notifications = require('../notifications//notifications.model'),
    tests = require('./tests'),
    health = require('./health.model'),
    loadModel = require('./load.model'),
    resourceSearch = require('../resource/search/resourceSearch'),
//    severity = require('./severity').severity,
    getMostSevere = require('./severity').getMostSevere,
    _ = require('lodash'),
    objectHash = require('object-hash'),
    status = {};

module.exports = onComplete;

function onComplete() {
    return new Promise(function(resolve) {
        function check() {
            if (status.health && status.messages && status.load) {
                resolve(function() {
return status;
});
            } else {
                setTimeout(check, 2000);
            }
        }
        check();
    });
}
// start by updating status
update();
// after that update every 10 seconds
setInterval(function() {
    update();
}, 30000);

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

    // test for change
    status.hash = objectHash({
        health: status.health,
        messages: status.messages
    });
    status.updatedAt = (new Date()).toISOString();
}

async function updateMessages() {
    try {
        let timestamp = (new Date()).toISOString();
        let q = {'contentType': 'notification', 'start': '*,' + timestamp, 'end': timestamp + ',*'};
        let options = {rawResponse: true};
        let messages = await resourceSearch.search(q, null, options);

        let messageStatus = messages.results.reduce(function(current, message) {
            return getMostSevere(message.severity, current);
        }, 'OPERATIONAL');

        updateStatus({
            messages: {
                list: messages.results,
                severity: messageStatus
            }
        });
    } catch (err) {
        // console.log(err); //TODO log
        updateStatus({failure: err});
    }
}

function updateHealth() {
    function done(summary) {
        updateStatus({health: summary});
    }

    function progress() {
        // ignore progress updates
    }

    function failed(err) {
        // console.log(err); //TODO log
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
        // console.log(err); //TODO log;
        updateStatus({failure: err});
    }
}
