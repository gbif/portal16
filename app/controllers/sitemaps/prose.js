"use strict";
let resourceSearch = rootRequire('app/controllers/api/resource/search/resourceSearch'),
    _ = require('lodash'),
    contentTypes = _.pull(resourceSearch.contentTypes, 'literature');

module.exports = {
    getAllProse: getAllProse
};

async function getAllProse(__) {
    let prose = await resourceSearch.search({contentType: contentTypes, limit: 10000}, __, 120000);
    return prose;
}