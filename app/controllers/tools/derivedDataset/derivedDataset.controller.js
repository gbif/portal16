'use strict';
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    log = require('../../../../config/log'),
    authOperations = require('../../auth/gbifAuthRequest');

module.exports = {
    createDerivedDatasetAsJson: createDerivedDatasetAsJson,
    updateDerivedDatasetAsJson: updateDerivedDatasetAsJson
};


async function createDerivedDatasetAsJson(data, user) {
    let options = {
        url: apiConfig.derivedDataset.url,
        canonicalPath: apiConfig.derivedDataset.canonical,
        body: data,
        userName: user.userName,
        method: 'POST'
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 201) {
        logError(response, data);
        throw response;
    }
    return response.body;
}

async function updateDerivedDatasetAsJson(data, user) {
    let options = {
        url: apiConfig.derivedDataset.url + data.doi,
        canonicalPath: apiConfig.derivedDataset.canonical,
        body: data,
        userName: user.userName,
        method: 'PUT'
    };
    let response = await authOperations.authenticatedRequest(options);
    if (response.statusCode !== 204) {
        logError(response, data);
        throw response;
    }
    return response.body;
}


function logError(err, data) {
        log.error('Derived dataset form submission failure: ' + (err.message || err.body));
        log.error('Derived dataset form failed to handle data: ' + JSON.stringify(data));
}

