var path = require('path'),
    log = require('./log'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
    development: {
        root: rootPath,
        app: {
            name: 'portal - dev'
        },
        port: 3000,
        log: log
    },

    test: {
        root: rootPath,
        app: {
            name: 'portal - test'
        },
        port: 3000,
        log: log
    },

    production: {
        root: rootPath,
        app: {
            name: 'portal - prod'
        },
        port: 3000,
        log: log
    }
};

module.exports = config[env];
