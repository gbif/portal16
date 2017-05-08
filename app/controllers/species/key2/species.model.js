"use strict";
let apiConfig = require('../../../models/gbifdata/apiConfig'),
    request = require('requestretry');

module.exports = {
    getByKey: getByKey
};

async function getByKey(key, include) {
    let loginRequest = {
        url: apiConfig.taxon.url + key,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(loginRequest);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}