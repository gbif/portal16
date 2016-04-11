'use strict';

var express = require('express'),
    config = require('./config/config');

var app = express();

global.rootRequire = function(name) {
    return require(__dirname + '/' + name);
};

require('./config/express')(app, config);

app.listen(config.port, function() {
    console.log('Express server listening on port ' + config.port);
});
