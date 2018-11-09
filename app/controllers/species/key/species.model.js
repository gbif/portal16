'use strict';
let apiConfig = require('../../../models/gbifdata/apiConfig'),
    request = rootRequire('app/helpers/request');

module.exports = {
    getByKey: getByKey
};

async function getByKey(key) {
    let options = {
        url: apiConfig.taxon.url + key,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}
