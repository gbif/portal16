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

var apidocs = "http://gbif.github.io/gbif-api/apidocs/org/gbif/api";

var config = {
    local: {
        env: 'dev',
        root: rootPath,
        app: {
            name: 'portal - local'
        },
        port: port || 3000,
        log: log,
        githubPassword: ghpw,
        apidocs: apidocs,
        dataApi: dataApi || 'http://api.gbif.org/v1/',
        tileApi: tileApi || 'http://api.gbif.org/v1/map/density/tile.png',
        cmsApi: cmsApi || 'http://cms.gbif-dev.org/api/',
        analyticsImg: analyticsImg || 'cms.gbif-dev.org/sites/default/files/gbif_analytics/'
    },
    dev: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - dev'
        },
        port: port || 80,
        log: log,
        githubPassword: ghpw,
        apidocs: apidocs,
        dataApi: dataApi || 'http://api.gbif.org/v1/',
        tileApi: tileApi || 'http://api.gbif.org/v1/map/density/tile.png',
        cmsApi: cmsApi || 'http://cms.gbif-dev.org/api/',
        analyticsImg: analyticsImg || 'cms.gbif-dev.org/sites/default/files/gbif_analytics/'
    },
    uat: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - uat'
        },
        port: port || 80,
        log: log,
        githubPassword: ghpw,
        apidocs: apidocs,
        dataApi: dataApi || 'http://api.gbif.org/v1/',
        tileApi: tileApi || 'http://api.gbif.org/v1/map/density/tile.png',
        cmsApi: cmsApi || 'http://cms.gbif-dev.org/api/',
        analyticsImg: analyticsImg || 'cms.gbif-dev.org/sites/default/files/gbif_analytics/'
    },
    prod: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - prod'
        },
        port: port || 80,
        log: log,
        githubPassword: ghpw,
        apidocs: apidocs,
        dataApi: dataApi || 'http://api.gbif.org/v1/',
        tileApi: tileApi || 'http://cdn.gbif.org/v1/map/density/tile.png',
        cmsApi: cmsApi || 'http://cms.gbif-dev.org/api/',
        analyticsImg: analyticsImg || 'cms.gbif-dev.org/sites/default/files/gbif_analytics/'
    },
    test: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - test'
        },
        port: port || 3000,
        log: log,
        githubPassword: ghpw,
        apidocs: apidocs,
        dataApi: dataApi || 'http://api.gbif-dev.org/v1/',
        tileApi: tileApi || 'http://api.gbif-dev.org/v1/map/density/tile.png',
        cmsApi: cmsApi || 'http://cms.gbif-dev.org/api/',
        analyticsImg: analyticsImg || 'cms.gbif-dev.org/sites/default/files/gbif_analytics/'
    }
};

module.exports = Object.freeze(config[env]);
