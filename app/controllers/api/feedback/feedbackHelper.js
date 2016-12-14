"use strict";

const url = require('url');
let _ = require('lodash'),
    hash = require('object-hash'),
    occurrenceRegEx = /occurrence\/[0-9]+/,
    speciesRegEx = /species\/[0-9]+/,
    datasetRegEx = /dataset\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/,
    publisherRegEx = /publisher\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;

//be aware that changing this method will break the linkage between reported issues and the items they are about. If doing so the issues body text that is used as an identifier fbitem-[something] should be updated to match the new identifications schema
function extractIdentifer(referer) {
    var urlObject, path;
    try {
        urlObject = url.parse(referer);
        path = urlObject.pathname;
    } catch (err) {
        return undefined;
    }

    var occurrenceId = _.get(path.match(occurrenceRegEx), '0', undefined);
    if (occurrenceId) return cleanKnownPattern(occurrenceId);

    var speciesId = _.get(path.match(speciesRegEx), '0', undefined);
    if (speciesId) return cleanKnownPattern(speciesId);

    var datasetId = _.get(path.match(datasetRegEx), '0', undefined);
    if (datasetId) return cleanKnownPattern(datasetId);

    var publisherId = _.get(path.match(publisherRegEx), '0', undefined);
    if (publisherId) return cleanKnownPattern(publisherId);

    //if not a predefined url pattern then hash url and add prefix.
    return addPrefix(hash(cleanUrl(path)));
}

function cleanKnownPattern(str) {
    //add prefix, remove trailing slashes and replace /  as Github breaks tokens on /
    return addPrefix(cleanUrl(str).replace('/', ''));
}
function addPrefix(str) {
    return 'fbitem-' + str;
}

function cleanUrl(str) {
    //remove trailing slashes
    str = str.replace(/^\//, '');
    str = str.replace(/\/$/, '');
    return str;
}

module.exports = {
    extractIdentifer: extractIdentifer
};
