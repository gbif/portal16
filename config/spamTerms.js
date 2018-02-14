let config = require('./config');
let spamTerms = require(config.spamTerms);

module.exports = Object.freeze(spamTerms);