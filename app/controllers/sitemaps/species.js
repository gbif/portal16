'use strict';
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    config = rootRequire('config/config'),
    request = require('requestretry');

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
    return getSitemap(apiConfig.base.url + 'sitemap/species', 'https:' + config.dataApi, config.domain + '/');
}

function getSpeciesSiteMap(no) {
    return getSitemap(apiConfig.base.url + 'sitemap/species/' + no + '.txt', 'www', 'www');
}
