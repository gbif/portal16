let config = require('./config');

let spamTerms = require('fs').readFileSync(config.spamTerms, 'utf-8')
    .split('\n').filter(Boolean);

    console.log(spamTerms);

module.exports = Object.freeze(spamTerms);