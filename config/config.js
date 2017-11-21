var path = require('path'),
    log = require('./log'),
    yargs = require('yargs').argv,
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'local',
    port = yargs.port,
    dataApiV2 = yargs.dataapiv2,
    dataApi = yargs.dataapi,
    tileApi = yargs.tileapi,
    basemapTileApi = yargs.basemapTileApi,
    identityApi = yargs.identityApi,
    credentials = yargs.credentials,
    redirects = yargs.redirects,
    verification = yargs.verification,
    analyticsImg = yargs.analyticsImg,
    contentfulApi = yargs.contentfulApi,
    contentfulPreviewApi = yargs.contentfulPreviewApi,
    oozie = yargs.oozie,
    yarnResourceManager = yargs.yarnResourceManager,
    elk = yargs.elk,
    publicConstantKeys = {
        dataset: {
            backbone: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
            col: '7ddf754f-d193-4cc9-b351-99906754a03b'
        },
        node: {
            secretariat: '02c40d2a-1cba-4633-90b7-e36e5e97aba8',
            participantNodeManagersCommittee: '7f48e0c8-5c96-49ec-b972-30748e339115',
            'OBIS_NODE_KEY': 'ba0670b9-4186-41e6-8e70-f9cb3065551a'
        },
        network: {
            backboneNetwork: "029f9226-0d8a-4f28-97fe-13180e9eb0e5"
        }
    },
    elasticContentful = yargs.elasticContentful,
    apidocs = "http://gbif.github.io/gbif-api/apidocs/org/gbif/api",
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
    defaultLocale = 'en',
    userAgent = 'GBIF_WEBSITE';

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
        dataApiV2: dataApiV2 || '//api.gbif.org/v2/',
        dataApi: dataApi || '//api.gbif.org/v1/',
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif.org',
        identityApi: identityApi || '//api.gbif.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'http://localhost:3000',
        topDomain: undefined,
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        verification: verification || (rootPath + '/app/models/verification/sample'),
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-dev.org:9200/',//'http://cms-search.gbif-dev.org:9200/',
        oozie: oozie || '//c5master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c5master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//elk.gbif.org:5601/',
        locales: locales,
        defaultLocale: defaultLocale,
        contentfulLocaleMap: contentfulLocaleMap,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent
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
        dataApiV2: dataApiV2 || '//api.gbif-dev.org/v2/',
        dataApi: dataApi || '//api.gbif-dev.org/v1/',
        tileApi: tileApi || '//api.gbif-dev.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif-dev.org',
        identityApi: identityApi || '//api.gbif-dev.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif-dev.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-dev.org',
        topDomain: 'gbif-dev.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-dev.org:9200/',
        oozie: oozie || '//c5master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c5master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//elk.gbif.org:5601/',
        locales: locales,
        defaultLocale: defaultLocale,
        contentfulLocaleMap: contentfulLocaleMap,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent
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
        dataApi: dataApi || '//api.gbif-uat.org/v1/',
        tileApi: tileApi || '//api.gbif-uat.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif-uat.org',
        identityApi: identityApi || '//api.gbif-uat.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif-uat.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-uat.org',
        topDomain: 'gbif-uat.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-uat.org:9200/',
        oozie: oozie || '//c5master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c5master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//elk.gbif.org:5601/',
        locales: locales,
        defaultLocale: defaultLocale,
        contentfulLocaleMap: contentfulLocaleMap,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent
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
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif.org',
        identityApi: identityApi || '//api.gbif.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif.org',
        topDomain: 'gbif.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        oozie: oozie || '//c5master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c5master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//elk.gbif.org:5601/',
        locales: locales,
        defaultLocale: defaultLocale,
        contentfulLocaleMap: contentfulLocaleMap,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent
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
        dataApiV2: dataApiV2 || '//api.gbif.org/v2/',
        dataApi: dataApi || '//api.gbif.org/v1/',
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif.org',
        identityApi: identityApi || '//labs.gbif-uat.org:7003/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-dev.org',
        topDomain: 'gbif-dev.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        oozie: oozie || '//c5master1-vh.gbif.org:11000/oozie/v2/',
        yarnResourceManager: yarnResourceManager || '//c5master2-vh.gbif.org:8088/ws/v1/',
        elk: elk || '//elk.gbif.org:5601/',
        locales: locales,
        defaultLocale: defaultLocale,
        contentfulLocaleMap: contentfulLocaleMap,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent
    }
};

module.exports = Object.freeze(config[env]);
