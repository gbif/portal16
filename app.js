'use strict';

var express = require('express'),
    config = require('./config/config');
    log = config.log;

var app = express(),
    http = require('http').Server(app);
    //io = require('socket.io')(http);

global.rootRequire = function (name) {
    return require(__dirname + '/' + name);
};

require('./config/express')(app, config);

http.listen(config.port, function () {
    log.info('Express server listening on port ' + config.port);
});
