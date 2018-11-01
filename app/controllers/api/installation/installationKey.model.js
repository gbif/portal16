'use strict';
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    format = rootRequire('app/helpers/format'),
    _ = require('lodash'),
    contributors = rootRequire('app/controllers/dataset/key/contributors/contributors'),
    request = rootRequire('app/helpers/request');

module.exports = {
    getInstallation: getInstallation
};

async function getInstallation(key) {
    let baseRequest = {
        url: apiConfig.installation.url + key,
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let response = await request(baseRequest);
    if (response.statusCode > 299) {
        throw response;
    }
    let installation = response.body;
    installation._computedValues = {};
    installation._computedValues.contributors = contributors.getContributors(installation.contacts);
    clean(installation);
    return installation;
}

function clean(obj) {
    cleanField(obj, 'description');
}

function cleanField(o, field) {
    if (_.has(o, field)) {
        _.set(o, field, format.sanitize(format.linkify(format.decodeHtml(_.get(o, field)))));
    }
}
