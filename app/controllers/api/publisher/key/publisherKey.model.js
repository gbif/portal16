'use strict';
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    format = rootRequire('app/helpers/format'),
    _ = require('lodash'),
    contributors = rootRequire('app/controllers/dataset/key/contributors/contributors'),
    request = rootRequire('app/helpers/request');

module.exports = {
    getPublisher: getPublisher
};

async function getPublisher(key) {
    let baseRequest = {
        url: apiConfig.publisher.url + key,
        method: 'GET',
        json: true,
        fullResponse: true
    };

    let response = await request(baseRequest);
    if (response.statusCode > 299) {
        throw response;
    }
    let publisher = response.body;
    publisher._computedValues = {};
    publisher._computedValues.contributors = contributors.getContributors(publisher.contacts);
    clean(publisher);
    return publisher;
}

function clean(obj) {
    cleanField(obj, 'description');
}

function cleanField(o, field) {
    if (_.has(o, field)) {
        _.set(o, field, format.sanitize(format.linkify(format.decodeHtml(_.get(o, field)))));
    }
}
