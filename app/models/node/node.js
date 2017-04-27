"use strict";

var utils = rootRequire('app/helpers/utils'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    directoryNode = require('../directoryNode'),
    _ = require('lodash'),
    request = require('requestretry');

function getRegistryNode(id) {
    let baseRequest = {
        url: apiConfig.node.url + nodeKey,
        timeout: 30000,
        method: 'GET',
        json: true
    };
    return request(baseRequest);
}

module.exports = {

}