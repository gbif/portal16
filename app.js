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

    log.error('Log startup - Express server listening on port ' + config.port);
    log.error({mykey: 'unique24986', myNested: {nestedKey: 2974}}, 'MORTEN WAS HERE');

    console.log('Express server listening on port ' + config.port);
});
