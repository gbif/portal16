const requestAgents = require('./requestAgents');
const url = require('url');
const _ = require('lodash');

const agentMapping = [
  {startsWith: '/v1/occurrence/', requestAgent: requestAgents.occurrence},
  {startsWith: '/v1/species/', requestAgent: requestAgents.species}
];

function wrapper(options) {
  const path = url.parse(options.url).path;
  let match = _.find(agentMapping, function(e) {
    if (e.startsWith) {
      return path.startsWith(e.startsWith);
    }
  });
  let requestAgent = match ? match.requestAgent : requestAgents.standard;
  // eslint-disable-next-line prefer-rest-params
  let callbackIfAny = typeof arguments[1] === 'function' ? arguments[1] : undefined;
  // eslint-disable-next-line prefer-rest-params
  return requestAgent(arguments[0])
    .then(function(response) {
      if (callbackIfAny) {
        callbackIfAny(null, response, response.body);
      } else {
        return response;
      }
    })
    .catch(function(err) {
      if (callbackIfAny) {
        callbackIfAny(err);
      } else {
        throw err;
      }
    });
}

let failingURLs = [
  '/v1/dataset/85ae9a58-f762-11e1-a439-00145eb45e9a'
];

let failingURLSubstrings = [
];

function failingWrapper(options) {
  const path = url.parse(options.url).path;
  let requestAgent = requestAgents.standard;
  // eslint-disable-next-line prefer-rest-params
  let callbackIfAny = typeof arguments[1] === 'function' ? arguments[1] : undefined;

  let failUrlMatch = _.find(failingURLs, function(e) {
    return path === e;
  });
  let failUrlPartMatch = _.find(failingURLSubstrings, function(e) {
    return path.startsWith(e.startsWith);
  });

  let shouldFail = (failUrlMatch || failUrlPartMatch);

  // eslint-disable-next-line prefer-rest-params
  return requestAgent(arguments[0])
    .then(function(response) {
      if (shouldFail) {
        if (callbackIfAny) {
          callbackIfAny(new Error('Failed on purpose in request wrapper. This should only happen when running locally'));
          return;
        }
        throw new Error('Failed on purpose in request wrapper. This should only happen when running locally');
      }
      if (callbackIfAny) {
        callbackIfAny(null, response, response.body);
      } else {
        return response;
      }
    })
    .catch(function(err) {
      if (callbackIfAny) {
        callbackIfAny(err);
      } else {
        throw err;
      }
    });
}

let requestWrapper = wrapper;

if (process.env.NODE_ENV !== 'local') {
  requestWrapper = wrapper; // just to make sure someone doesn't forget to remove this for testing
}

module.exports = requestWrapper;
