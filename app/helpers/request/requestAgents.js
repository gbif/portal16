let request = require('requestretry');
let Agent = require('agentkeepalive');

// See https://www.npmjs.com/package/agentkeepalive
const stdAgent = new Agent({
  maxSockets: 8000, // Default = Infinity
  maxFreeSockets: 256, // default
  keepAlive: true,
  keepAliveMsecs: 1000
});

let stdRequest = request.defaults({
  agent: stdAgent,
  headers: {
    'User-Agent': 'GBIF-portal'
  },
  maxAttempts: 1,
  retryDelay: 3000, // in milliseconds
  retryStrategy: request.RetryStrategies.HTTPOrNetworkError, // (default) retry on 5xx or network errors
  timeout: 20000 // in milliseconds
});

// seperate pool for occurrence requests as that API often has outages.
const occurrenceAgent = new Agent({
  maxSockets: 8000, // Default = Infinity
  maxFreeSockets: 256, // default
  keepAlive: true,
  keepAliveMsecs: 1000
});

let occurrenceRequest = request.defaults({
  agent: occurrenceAgent,
  headers: {
    'User-Agent': 'GBIF-portal Occurrence'
  },
  maxAttempts: 1,
  retryDelay: 3000, // in milliseconds
  retryStrategy: request.RetryStrategies.HTTPOrNetworkError, // (default) retry on 5xx or network errors
  timeout: 45000 // in milliseconds
});


// seperate pool for species requests as that API often has outages.
const speciesAgent = new Agent({
  maxSockets: 8000, // Default = Infinity
  maxFreeSockets: 256, // default
  keepAlive: true,
  keepAliveMsecs: 1000
});

let speciesRequest = request.defaults({
  agent: speciesAgent,
  headers: {
    'User-Agent': 'GBIF-portal Occurrence'
  },
  maxAttempts: 1,
  retryDelay: 3000, // in milliseconds
  retryStrategy: request.RetryStrategies.HTTPOrNetworkError, // (default) retry on 5xx or network errors
  timeout: 45000 // in milliseconds
});

module.exports = {
    standard: stdRequest,
    occurrence: occurrenceRequest,
    species: speciesRequest
};
