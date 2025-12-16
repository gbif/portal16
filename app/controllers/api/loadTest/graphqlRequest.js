const request = require('request');
const log = require('../../../../config/log');
const baseConfig = rootRequire('config/config');

function graphqlRequest(query, variables) {
  try {
    let options = {
      url: 'https:' + baseConfig.graphQLApi,
      method: 'POST',
      json: true,
      body: {
        query: query,
        variables: variables
      }
    };
    return request(options, function (error, response, body) {
      if (error) {
        log.error('Load test request to GraphQL failed: ' + error.message, { query, variables });
        return;
      }
      if (response.statusCode !== 200) {
        log.error('Load test request to GraphQL failed with status code: ' + response.statusCode, {query, variables});
        return;
      }
      if (body.errors) {
        log.error('Load test request to GraphQL returned errors: ' + JSON.stringify(body.errors), {query, variables});
        return;
      }
    });
  } catch (err) {
    // silently ignore if the whole thing failed
    console.error(err);
  }
}

function replaceKeyInVariables(variables, oldKey, newKey) {
  return JSON.parse(JSON.stringify(variables).replace(oldKey, newKey));
}

module.exports = {
  graphqlRequest,
  replaceKeyInVariables
};