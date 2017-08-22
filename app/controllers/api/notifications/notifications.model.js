"use strict";
let github = require('octonode'),
    credentials = rootRequire('config/credentials').portalFeedback,
    resourceSearch = require('../../../resource/key/resourceKey'),
    _ = require('lodash'),
    log = rootRequire('config/log'),
    moment = require("moment");

async function getNotifications(){
    let timestamp = (new Date()).toISOString();
    let resources = await resourceSearch.searchContentful({content_type:'notification', 'fields.start[lt]': timestamp, 'fields.end[gt]': timestamp}, 0, false, 'en');
    return {
        count: resources.total,
        limit: resources.limit,
        results: resources.items.map(function(e){return e.fields})
    };
}

module.exports = {
    getNotifications: getNotifications
};
