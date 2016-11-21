var path = require('path'),
    log = require('./log'),
    yargs = require('yargs').argv,
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'local',
    port = yargs.port,
    dataApi = yargs.dataapi,
    tileApi = yargs.tileapi,
    cmsApi = yargs.cmsapi,
    analyticsImg = yargs.analyticsImg,
    ghpw = yargs.ghpw;

var apidocs = "//gbif.github.io/gbif-api/apidocs/org/gbif/api";

var config = {
    local: {
        env: 'dev',
        root: rootPath,
        app: {
            name: 'portal - local'
        },
        port: port || 3000,
        log: log,
        serverProtocol: 'http:',
        apidocs: apidocs,
        dataApi: dataApi || '//api.gbif.org/v1/', // NB not dev!
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png', // NB not dev!
        cmsApi: cmsApi || '//cms-api.gbif-uat.org/api/',
        analyticsImg: analyticsImg || 'cms-api.gbif-uat.org/sites/default/files/gbif_analytics/',
        domain: 'https://gbif-dev.org/'
    },
    dev: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - dev'
        },
        port: port || 80,
        log: log,
        serverProtocol: 'http:',
        apidocs: apidocs,
        dataApi: dataApi || '//api.gbif.org/v1/', // NB not dev!
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png', // NB not dev!
        cmsApi: cmsApi || '//cms-api.gbif-dev.org/api/',
        analyticsImg: analyticsImg || 'cms-api.gbif-dev.org/sites/default/files/gbif_analytics/',
        domain: 'https://gbif-dev.org/'
    },
    uat: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - uat'
        },
        port: port || 80,
        log: log,
        serverProtocol: 'http:',
        apidocs: apidocs,
        dataApi: dataApi || '//api.gbif-uat.org/v1/',
        tileApi: tileApi || '//api.gbif-uat.org/v1/map/density/tile.png',
        cmsApi: cmsApi || '//cms-api.gbif-uat.org/api/',
        analyticsImg: analyticsImg || 'cms-api.gbif-uat.org/sites/default/files/gbif_analytics/',
        domain: 'https://gbif-uat.org/'
    },
    prod: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - prod'
        },
        port: port || 80,
        log: log,
        serverProtocol: 'http:',
        apidocs: apidocs,
        dataApi: dataApi || '//api.gbif.org/v1/',
        tileApi: tileApi || '//cdn.gbif.org/v1/map/density/tile.png',
        cmsApi: cmsApi || '//cms-api.gbif-uat.org/api/', // NB not prod!
        analyticsImg: analyticsImg || 'cms-api.gbif-uat.org/sites/default/files/gbif_analytics/', // NB not prod!
        domain: 'https://demo.gbif.org/'
    },
    test: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - test'
        },
        port: port || 3000,
        log: log,
        serverProtocol: 'http:',
        apidocs: apidocs,
        dataApi: dataApi || '//api.gbif-dev.org/v1/',
        tileApi: tileApi || '//api.gbif-dev.org/v1/map/density/tile.png',
        cmsApi: cmsApi || '//cms-api.gbif-dev.org/api/',
        analyticsImg: analyticsImg || 'cms-api.gbif-dev.org/sites/default/files/gbif_analytics/',
        domain: 'https://gbif-dev.org/'
    }
};

module.exports = Object.freeze(config[env]);
