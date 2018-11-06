const requestAgents = require('./requestAgents');
const url = require('url');
const _ = require('lodash');

const agentMapping = [
  {startsWith: '/v1/occurrence/', requestAgent: requestAgents.occurrence}
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
  return requestAgent(...arguments);
}

module.exports = wrapper;
