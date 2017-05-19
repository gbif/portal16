const request = require('requestretry'),
    querystring = require('querystring'),
    apiConfig = require('./apiConfig'),
    credentials = rootRequire('config/config').credentials.contentful.gbif;

module.exports = {
    getEntity: getEntity
};

/**
 * returns the contentful item based on its entity id. depth is how many levels of depth to include refered content from (linked items and assets).
 * preview: use preview api
 */
function getEntity(id, depth, preview) {
    let space = credentials.space,
        contentfulApi = preview ? apiConfig.contentful.previewUrl : apiConfig.contentful.url,
        access_token = preview ? credentials.preview_access_token : credentials.access_token,
        query = {
            access_token: access_token,
            include: depth || 1,
            'sys.id': entryId
        },
        url = contentfulApi + 'spaces/' + space + '/entries?' + querystring.stringify(query);

    var userRequest = {
        url: url,
        maxAttempts: 5,   // (default) try 5 times
        retryDelay: 5000,  // (default) wait for 5s before trying again
        retryStrategy: request.RetryStrategies.HTTPOrNetworkError, // (default) retry on 5xx or network errors
        timeout: 30000,
        method: 'GET',
        headers: {
            'x-gbif-user-session': userSessionCookie
        }
    };
    return request(userRequest);
}

//function getDataUseStory(id) {
//}
//
//function getNewsStory(id) {
//}
//
//function getTool(id) {
//}
//
//function getParticipant(id) {
//}
//
//function getProgramme(id) {
//}
//
//function getProject(id) {
//}
//
//function getGeneric(id) {
//}