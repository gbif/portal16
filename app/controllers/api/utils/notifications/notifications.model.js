"use strict";
let github = require('octonode'),
    credentials = rootRequire('config/credentials').portalFeedback,
    _ = require('lodash'),
    log = rootRequire('config/log'),
    moment = require("moment");


function getNotifications(startDate){
    let client = github.client({
            username: credentials.user,
            password: credentials.password
        }),
        ghsearch = client.search();

    let githubPromise = new Promise(function(resolve, reject){
        ghsearch.issues({
            q: 'is:issue is:open label:notification+repo:' + credentials.repository,
            sort: 'created', //'reactions-+1',
            order: 'desc',
            per_page: 20
        }, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.items);
            }
        });
    });
    return githubPromise;
}


module.exports = {
    getNotifications: getNotifications
};