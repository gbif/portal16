var path = require('path'),
    log = require('./log'),
    yargs = require('yargs').argv,
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'local',
    port = yargs.port,
    dataApiV2 = yargs.dataapiv2,
    dataApi = yargs.dataapi,
    tileApi = yargs.tileapi,
    identityApi = yargs.identityApi,
    credentials = yargs.credentials,
    redirects = yargs.redirects,
    verification = yargs.verification,
    analyticsImg = yargs.analyticsImg,
    contentfulApi = yargs.contentfulApi,
    contentfulPreviewApi = yargs.contentfulPreviewApi,
    publicConstantKeys = {
        dataset: {
            backbone: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
            col: '7ddf754f-d193-4cc9-b351-99906754a03b'
        },
        node: {
            secretariat: '02c40d2a-1cba-4633-90b7-e36e5e97aba8',
            participantNodeManagersCommittee: '7f48e0c8-5c96-49ec-b972-30748e339115'
        }
    },
    elasticContentful = yargs.elasticContentful,
    apidocs = "//gbif.github.io/gbif-api/apidocs/org/gbif/api",
    locales = ['en', 'es', 'da'],
    contentfulLocaleMap = {
        'en': 'en-GB',
        'es': 'es',
        'ar': 'ar',
        'zh': 'zh',
        'fr': 'fr',
        'ru': 'ru',
        'pt': 'pt'
    },
    defaultLocale = 'en';

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
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',
        identityApi: identityApi || '//api.gbif-uat.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://demo.gbif.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        verification: verification || (rootPath + '/app/models/verification/sample'),
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        locales: locales,
        defaultLocale: defaultLocale,
        contentfulLocaleMap: contentfulLocaleMap,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342
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
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',// NB not dev!
        identityApi: identityApi || '//api.gbif-dev.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://demo.gbif-dev.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-dev.org:9200/',
        locales: locales,
        defaultLocale: defaultLocale,
        contentfulLocaleMap: contentfulLocaleMap,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342
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
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',// NB not uat!
        identityApi: identityApi || '//api.gbif-uat.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://demo.gbif-uat.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-uat.org:9200/',
        locales: locales,
        defaultLocale: defaultLocale,
        contentfulLocaleMap: contentfulLocaleMap,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342
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
        dataApiV2: dataApiV2 || '//api.gbif-uat.org/v2/',
        dataApi: dataApi || '//api.gbif.org/v1/',
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',
        identityApi: identityApi || '//labs.gbif.org:7003/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://demo.gbif.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        locales: locales,
        defaultLocale: defaultLocale,
        contentfulLocaleMap: contentfulLocaleMap,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342
    },
    c5prod: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - c5prod'
        },
        port: port || 8080,
        log: log,
        serverProtocol: 'http:',
        apidocs: apidocs,
        dataApiV2: dataApiV2 || '//api-c5.gbif.org/v2/',
        dataApi: dataApi || '//api-c5.gbif.org/v1/',
        tileApi: tileApi || '//api-c5.gbif.org/v1/map/density/tile.png',
        identityApi: identityApi || '//labs.gbif.org:7003/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://demo.gbif.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        locales: locales,
        defaultLocale: defaultLocale,
        contentfulLocaleMap: contentfulLocaleMap,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342
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
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',
        identityApi: identityApi || '//labs.gbif-uat.org:7003/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://demo.gbif-dev.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        locales: locales,
        defaultLocale: defaultLocale,
        contentfulLocaleMap: contentfulLocaleMap,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342
    }
};

module.exports = Object.freeze(config[env]);
