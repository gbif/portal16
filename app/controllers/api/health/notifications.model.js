"use strict";

let notifications = require('../notifications//notifications.model'),
    tests = require('./tests'),
    health = require('./health.model'),
    resourceSearch = require('../resource/search/resourceSearch'),
    severity = require('./severity').severity,
    severityMap = require('./severity').severityMap,
    _ = require('lodash'),
    request = require('requestretry'),
    objectHash = require('object-hash'),
    status = {};

module.exports = function(){return status};

//start by updating status
update();
//after that update every 10 seconds
setInterval(function () {
    update();
}, 10000);

function update(){
    updateHealth();
    updateMessages();
}

function getMostSevere(a, b){
    return severityMap[a] < severityMap[b] ? b : a;
}

function updateStatus(update) {
    let prevHash = status.hash;
    status.health = update.health ? update.health : status.health;
    status.messages = update.messages ? update.messages : status.messages;
    status.status = getMostSevere(_.get(update, 'health.status'), _.get(update, 'messages.status'));

    //test for change
    status.hash = objectHash({
        health: status.health,
        messages: status.messages
    });
    if (prevHash != status.hash) {
        status.changed = true;
    } else {
        status.changed = false;
    }
    status.updatedAt = (new Date()).toISOString();
}

async function updateMessages() {
    try {
        let timestamp = (new Date()).toISOString();
        let q = {contentType: 'notification', 'start': '*,' + timestamp, 'end': timestamp + ',*'};
        let options = {rawResponse: true};
        let messages = await resourceSearch.search(q, null, options);
        //let url = 'https://www.gbif.org/api/resource/search?contentType=notification&start=*,' + timestamp;
        //let messages = await request({
        //    json: true,
        //    url: url
        //});

        let messageStatus = messages.results.reduce(function(current, message){
            return getMostSevere(message.notificationType, current);//severityMap[message.notificationType] < severityMap[current] ? current : message.notificationType;
        }, 'INFO');

        updateStatus({
            messages: {
                list: messages.results,
                status: messageStatus
            }
        });
        //if (messages.statusCode == 200) {
        //    updateStatus({messages: messages.body.results})
        //} else {
        //    updateStatus({messages: undefined})
        //}
    } catch(err) {
        console.log(err);
        updateStatus({failure: err});
    }
}

function updateHealth() {
    function done(summary) {
        updateStatus({health: summary});
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

