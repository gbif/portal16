let request = require('requestretry');
let Agent = require('agentkeepalive');

// See https://www.npmjs.com/package/agentkeepalive
const keepaliveAgent = new Agent({
  maxSockets: 1000, // Default = Infinity
  maxFreeSockets: 256, // default
  keepAlive: true,
  keepAliveMsecs: 5000
});

let baseRequest = request.defaults({
  agent: keepaliveAgent,
  headers: {
    'User-Agent': 'GBIF-portal'
  },
  maxAttempts: 2,
  retryDelay: 3000, // in milliseconds
  retryStrategy: request.RetryStrategies.HTTPOrNetworkError, // (default) retry on 5xx or network errors
  timeout: 20000 // in milliseconds
});

module.exports = baseRequest;
