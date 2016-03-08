var path = require('path'),
    log = require('./log'),
    yargs = require('yargs').argv,
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development',
    defaultPort = yargs.port || 3000;

var config = {
    development: {
        root: rootPath,
        app: {
            name: 'portal - dev'
        },
        port: defaultPort,
        log: log
    },

    test: {
        root: rootPath,
        app: {
            name: 'portal - test'
        },
        port: defaultPort,
        log: log
    },

    production: {
        root: rootPath,
        app: {
            name: 'portal - prod'
        },
        port: defaultPort,
        log: log
    }
};

module.exports = config[env];
