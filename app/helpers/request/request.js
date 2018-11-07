const requestAgents = require('./requestAgents');
const url = require('url');
const _ = require('lodash');
const log = require('../../../config/log');

let loggingBanned = false;
let activeRequestCount = 0;
let maxActiveRequestCount = 0;

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

  activeRequestCount++;
  maxActiveRequestCount = Math.max(maxActiveRequestCount, activeRequestCount);

  // eslint-disable-next-line prefer-rest-params
  return requestAgent(arguments[0])
    .then(function(response) {
      activeRequestCount--;
      logActivity();
      if (callbackIfAny) {
        callbackIfAny(null, response, response.body);
      } else {
        return response;
      }
    })
    .catch(function(err) {
      activeRequestCount--;
      logActivity();
      if (callbackIfAny) {
        callbackIfAny(err);
      } else {
        throw err;
      }
    });
}

function logActivity() {
  if (!loggingBanned && activeRequestCount > 100) {
    loggingBanned = true;
    log.info({concurrentRequests: activeRequestCount, maxActiveRequestCount: maxActiveRequestCount}, 'Number of concurrent requests from the portal');
    setTimeout(function() {
      loggingBanned = false;
    }, 1000 * 60 * 5);
  }
}

let failingURLs = [
  // '/v1/occurrence/search/?datasetKey=3b8c5ed8-b6c2-4264-ac52-a9d772d69e9f&limit=0&facet=eventId&facetLimit=11&facetOffset=0'
];

let failingURLSubstrings = [
  // '/v1/species'
];

function failingWrapper(options) {
  const path = url.parse(options.url).path;
  console.log(path);
  let requestAgent = requestAgents.standard;
  // eslint-disable-next-line prefer-rest-params
  let callbackIfAny = typeof arguments[1] === 'function' ? arguments[1] : undefined;

  let failUrlMatch = _.find(failingURLs, function(e) {
    return path === e;
  });
  let failUrlPartMatch = _.find(failingURLSubstrings, function(e) {
    return path.startsWith(e);
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
