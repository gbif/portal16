"use strict";
var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    config = rootRequire('config/config'),
    querystring = require('querystring'),
    request = require('requestretry'),
    _ = require('lodash');

module.exports = {
    getSpeciesSiteMapIndex: getSpeciesSiteMapIndex,
    getSpeciesSiteMap: getSpeciesSiteMap
};


async function getSitemap(url, replaceText, replaceWith) {
    let options = {
        url: url,
        method: 'GET',
        fullResponse: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body.replace(new RegExp(replaceText, 'g'), replaceWith);
}

function getSpeciesSiteMapIndex() {
    console.log(apiConfig.base.url);
    return getSitemap(apiConfig.base.url + 'sitemap/species', config.dataApi, config.domain);
}

function getSpeciesSiteMap(no) {
    return getSitemap(apiConfig.base.url + 'sitemap/species/' + no + '.txt', 'www', 'demo');
}
