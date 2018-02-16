let config = require('./config');
let credentials = require(config.credentials);

module.exports = Object.freeze(credentials);
