'use strict';

let express = require('express');
let config = require('./config/config');
let log = require('./config/log');
let app = express();
let http = require('http').Server(app);

global.rootRequire = function(name) {
    return require(__dirname + '/' + name);
};

require('./config/express')(app, config);

http.listen(config.port, function() {
    log.info('Express server listening on port ' + config.port);
});
