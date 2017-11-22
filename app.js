'use strict';

var express = require('express'),
    config = require('./config/config');

var app = express(),
    http = require('http').Server(app);
    //io = require('socket.io')(http);

global.rootRequire = function (name) {
    return require(__dirname + '/' + name);
};

require('./config/express')(app, config);

http.listen(config.port, function () {
    console.log('Express server listening on port ' + config.port);
});
