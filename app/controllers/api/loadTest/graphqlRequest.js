const request = rootRequire('app/helpers/request');
const log = require('../../../../config/log');
const apiConfig = require('../../../models/gbifdata/apiConfig');

function graphqlRequest(query, variables) {
  try {
    let options = {
      url: apiConfig.graphQL.url,
      method: 'POST',
      json: true,
      body: {
        query: query,
        variables: variables
      }
    };
    return request(options)
      .then((response) => {
        if (response.errors) {
          return Promise.reject(new Error('GraphQL request failed: ' + JSON.stringify(response.errors)));
        }
        return response.data;
      }).catch((err) => {
        log.error('load test graphql request failed: ' + err.message);
      });
  } catch (err) {
    // silently ignore if the whole thing failed
  }
}

function replaceKeyInVariables(variables, oldKey, newKey) {
  return JSON.parse(JSON.stringify(variables).replace(oldKey, newKey));
}

module.exports = {
  graphqlRequest,
  replaceKeyInVariables
};