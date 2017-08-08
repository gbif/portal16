let config = require('./config');
let redirects = require(config.redirects);

module.exports = Object.freeze(redirects);