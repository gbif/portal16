var path = require('path'),
    log = require('./log'),
    yargs = require('yargs').argv,
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'local',
    port = yargs.port,
    dataApiV2 = yargs.dataapiv2,
    dataApi = yargs.dataapi,
    tileApi = yargs.tileapi,
    cmsApi = yargs.cmsapi,
    credentials = yargs.credentials,
    analyticsImg = yargs.analyticsImg;

var apidocs = "//gbif.github.io/gbif-api/apidocs/org/gbif/api";

// NB endpoints are VERY mixed. Ideally everything should be prod unless we are testing functionality that are developed in sync.
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
        dataApiV2: dataApiV2 || '//api.gbif-uat.org/v2/',
        dataApi: dataApi || '//api.gbif.org/v1/',
        tileApi: tileApi || '//cdn.gbif.org/v1/map/density/tile.png',
        cmsApi: cmsApi || '//cms-api.gbif-uat.org/api/',
        analyticsImg: analyticsImg || 'cms-api.gbif-uat.org/sites/default/files/gbif_analytics/',
        domain: 'https://gbif-dev.org/',
        credentials: credentials || '/etc/portal16/credentials'
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
        dataApiV2: dataApiV2 || '//api.gbif-uat.org/v2/',// NB not dev!
        dataApi: dataApi || '//api.gbif.org/v1/',// NB not dev!
        tileApi: tileApi || '//cdn.gbif.org/v1/map/density/tile.png',// NB not dev!
        cmsApi: cmsApi || '//cms-api.gbif-uat.org/api/', // NB not dev!
        analyticsImg: analyticsImg || 'cms-api.gbif-uat.org/sites/default/files/gbif_analytics/',// NB not dev!
        domain: 'https://gbif-dev.org/',
        credentials: credentials || '/etc/portal16/credentials'
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
        dataApiV2: dataApiV2 || '//api.gbif-uat.org/v2/',
        dataApi: dataApi || '//api.gbif.org/v1/',// NB not uat!
        tileApi: tileApi || '//cdn.gbif.org/v1/map/density/tile.png',// NB not uat!
        cmsApi: cmsApi || '//cms-api.gbif-uat.org/api/', // NB not prod!
        analyticsImg: analyticsImg || 'cms-api.gbif-uat.org/sites/default/files/gbif_analytics/',
        domain: 'https://gbif-uat.org/',
        credentials: credentials || '/etc/portal16/credentials'
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
        dataApiV2: dataApiV2 || '//api.gbif.org/v2/',
        dataApi: dataApi || '//api.gbif.org/v1/',
        tileApi: tileApi || '//cdn.gbif.org/v1/map/density/tile.png',
        cmsApi: cmsApi || '//cms-api.gbif-uat.org/api/', // NB not prod!
        analyticsImg: analyticsImg || 'cms-api.gbif-uat.org/sites/default/files/gbif_analytics/', // NB not prod!
        domain: 'https://demo.gbif.org/',
        credentials: credentials || '/etc/portal16/credentials'
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
        dataApiV2: dataApiV2 || '//api.gbif-uat.org/v2/',
        dataApi: dataApi || '//api.gbif.org/v1/',
        tileApi: tileApi || '//cdn.gbif.org/v1/map/density/tile.png',
        cmsApi: cmsApi || '//cms-api.gbif-uat.org/api/',
        analyticsImg: analyticsImg || 'cms-api.gbif-uat.org/sites/default/files/gbif_analytics/',
        domain: 'https://gbif-dev.org/',
        credentials: credentials || '/etc/portal16/credentials'
    }
};

module.exports = Object.freeze(config[env]);
