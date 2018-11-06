'use strict';
let nunjucks = require('nunjucks');
let _ = require('lodash');
let request = rootRequire('app/helpers/request');

async function getResource(url, options) {
    try {
        let resp = {};
        resp.record = await getItem(url);
        if (_.isArray(options.expand)) {
            // expand selected keys
            let expandPromises = [];

            options.expand.forEach(function(e) {
                // template url
                if (_.isArray(e.expect)) {
                    for (let i = 0; i < e.expect.length; i++) {
                        let expectedKey = e.expect[i];
                        if (!_.has(resp.record, expectedKey)) {
                            if (e.required !== false) {
                                throw new Error('Not all expected keys was present ' + expectedKey);
                            } else {
                                return;
                            }
                        }
                    }
                }
                let url = nunjucks.renderString(e.urlTemplate, resp.record);
                expandPromises.push(getItem(url, e));
            });

            let expanded = await Promise.all(expandPromises);

            // attach fields
            options.expand.forEach(function(e, i) {
                if (e.toField) {
                    resp[e.toField] = expanded[i];
                }
            });
        }
        return resp;
    } catch (err) {
        throw err;
    }
}

async function getItem(url, options) {
    options = options || {};
    let requestOptions = {
        method: 'GET',
        url: url,
        fullResponse: true,
        json: true,
        maxAttempts: options.maxAttempts || 5,
        retryDelay: 5000,
        timeout: options.timeout || 60000
    };

    let response = await request(requestOptions);

    if (response.statusCode !== 200) {
        if (options.required === false) {
            return undefined;
        } else {
            throw response;
        }
    }

    return response.body;
}

module.exports = {
    get: getResource
};
