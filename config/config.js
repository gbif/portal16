var path = require('path'),
    log = require('./log'),
    yargs = require('yargs').argv,
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development',
    defaultPort = yargs.port || 3000,
    dataApi = yargs.dataapi;

var config = {
    development: {
        root: rootPath,
        app: {
            name: 'portal - dev'
        },
        port: defaultPort,
        log: log,
        dataApi: dataApi || 'http://api.gbif.org/v1/'
    },
    uat: {
        root: rootPath,
        app: {
            name: 'portal - uat'
        },
        port: defaultPort,
        log: log,
        dataApi: dataApi || 'http://api.gbif-uat.org/v1/'
    },
    production: {
        root: rootPath,
        app: {
            name: 'portal - prod'
        },
        port: defaultPort,
        log: log,
        dataApi: dataApi || 'http://api.gbif.org/v1/'
    },
    test: {
        root: rootPath,
        app: {
            name: 'portal - test'
        },
        port: defaultPort,
        log: log,
        dataApi: dataApi || 'http://api.gbif.org/v1/'
    }
};

module.exports = Object.freeze(config[env]);
