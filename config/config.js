let path = require('path'),
    yargs = require('yargs').argv,
    rootPath = path.normalize(__dirname + '/..'),
    localeConfig = require('./locales'),
    env = process.env.NODE_ENV || 'local',
    port = yargs.port,
    dataApiV2 = yargs.dataapiv2,
    dataApi = yargs.dataapi,
    sourceArchive = yargs.sourceArchive,
    graphQLApi = yargs.graphqlApi,
    webUtils = yargs.webUtils,
    tileApi = yargs.tileapi,
    basemapTileApi = yargs.basemapTileApi,
    identityApi = yargs.identityApi,
    credentials = yargs.credentials,
    redirects = yargs.redirects,
    spamTerms = yargs.spamTerms,
    verification = yargs.verification,
    analyticsImg = yargs.analyticsImg,
    contentfulApi = yargs.contentfulApi,
    registry = yargs.registry,
    registryApi = yargs.registryApi,
    contentfulPreviewApi = yargs.contentfulPreviewApi,
    elk = yargs.elk,
    publicKibana = yargs.publicKibana,
    kibanaIndex = yargs.kibanaIndex,
    publicConstantKeys = {
        dataset: {
            backbone: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
            col: '7ddf754f-d193-4cc9-b351-99906754a03b',
            eod: '4fa7b334-ce0d-4e88-aaae-2e0c138d049e',
            iucn: '19491596-35ae-4a91-9a98-85cf505f1bd3',
            austrian_mycological_society: '55b9ac33-0532-46d3-9796-c4c157f2b097' // This needs to be excluded from showing type specimens on species pages
        },
        node: {
            'secretariat': '02c40d2a-1cba-4633-90b7-e36e5e97aba8',
            'participantNodeManagersCommittee': '7f48e0c8-5c96-49ec-b972-30748e339115',
            'OBIS_NODE_KEY': 'ba0670b9-4186-41e6-8e70-f9cb3065551a'
        },
        network: {
            backboneNetwork: '029f9226-0d8a-4f28-97fe-13180e9eb0e5',
            obisNetworkKey: '2b7c7b4f-4d4f-40d3-94de-c28b6fa054a6'
        },
        participant: {
            obisKey: 304
        },
        publisher: {
            'GRIIS': 'cdef28b1-db4e-4c58-aa71-3c5238c2d0b5',
            'PLAZI': '7ce8aef0-9e92-11dc-8738-b8a03c50a862'
        },
        treatmentPublishers: [ // this is a mess and not in a config file. It has to be used tomorrow morning, so uuids from multiple environments will be added in one array
            '8d5e227d-ddf8-45f5-953e-e54be3e65ad1', // BHL UAT
            'ad0aba77-575f-45d4-bdf7-aacbd27e01b2', // BHL prod
            '7ce8aef0-9e92-11dc-8738-b8a03c50a862', // Plazi in UAT and prod
            '750a8724-fa66-4c27-b645-bd58ac5ee010', // Biodiversity Data Journal - Pensoft
            // list of new pensoft publishers
            '07fa07e6-9d4f-4b82-99fb-1a2055991233',
            '1f27e074-e2c0-4cf2-9b78-731e9f789f00',
            '24eb42e2-7877-4e58-af67-4aea8a3cd177',
            '2a4eddf4-6e01-491c-8e59-c7948dfb943e',
            '33da3ffd-26aa-49cf-b30c-15d13186faca',
            '3996dc51-9cce-445b-a06f-7aba727bb0d8',
            '43999f3b-3220-490b-83f4-954cd43c3f6c',
            '45c9a2eb-b8f9-4d9f-a0e3-6ccd898f557b',
            '4a99b0fe-19ca-4e28-9682-4ea0e3bec4e0',
            '5aaf6f62-72a5-403f-8fae-e8f9cd4a18cd',
            '750a8724-fa66-4c27-b645-bd58ac5ee010',
            '7597e7d3-b8d6-4ecf-84a3-d731d8b6d290',
            '78b5476e-1eb5-4531-9ff1-e1971d43eb4d',
            '7ef749d5-b6e5-4e8e-9ff8-62bb9a192ee3',
            '9eb1b78c-2c2b-431e-8fd7-492734770611',
            'a019af3a-3982-4c10-9a27-2a793d40ed97',
            'aa95865f-a32f-46d4-8a10-178d69436a90',
            'ac084e47-e95d-4e30-ab94-115d4dec59b2',
            'adfff58c-db96-431d-9064-527cf09b0485',
            'af62a723-bd15-484a-995e-6fc6720c54f0',
            'b0e7edd4-d8b5-4b1c-bb5f-f6484e16c21c',
            'b7dc6d5d-49b7-4b55-936a-fb85e33d65e1',
            'bb922300-7ddb-11de-a300-90ac77aa923f',
            'bd140c06-099b-4b87-821a-2d4bedf53af4',
            'd9a8e26f-f479-45f2-9bf3-144c25965646',
            'eb49971d-5d73-4534-a87a-81443c0cd66b',
            'f6406919-13e5-48e9-9e99-8226df18fa6d',
            'fc871c4a-bb5e-4db6-b332-487bc23797f1',
            '03433ccd-5166-4730-94a9-e06ec25d1a72',
        ],
        mediatingPublishers: [
            '8d5e227d-ddf8-45f5-953e-e54be3e65ad1', // BHL UAT
            'ad0aba77-575f-45d4-bdf7-aacbd27e01b2', // BHL prod
            '7ce8aef0-9e92-11dc-8738-b8a03c50a862', // Plazi in UAT and prod
            '750a8724-fa66-4c27-b645-bd58ac5ee010' // Biodiversity Data Journal - Pensoft
        ]
    },
    elasticContentful = yargs.elasticContentful,
    apidocs = 'https://gbif.github.io/gbif-api/apidocs/org/gbif/api',
    userAgent = 'GBIF_WEBSITE',
    healthUpdateFrequency = 30000;

// NB endpoints are VERY mixed. Ideally everything should be prod unless we are testing functionality that are developed in sync.
const localEnvironmentPostFix = '-test'; // e.g. '-uat';
let config = {
    local: {
        productionSite: false,
        env: 'dev',
        healthEnv: 'uat',
        root: rootPath,
        app: {
            name: 'portal - local'
        },
        port: port || 3000,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: `//registry.gbif${localEnvironmentPostFix}.org/`,
        dataApiV2: dataApiV2 || `//api.gbif${localEnvironmentPostFix}.org/v2/`,
        dataApi: dataApi || `//api.gbif${localEnvironmentPostFix}.org/v1/`,
        registryApi: registryApi || `//registry-api.gbif${localEnvironmentPostFix}.org/`,
        sourceArchive: sourceArchive || `//source-archive.gbif${localEnvironmentPostFix}.org/`,
        graphQLApi: graphQLApi || `//graphql.gbif-staging.org/graphql`,
        webUtils: webUtils || `//localhost:4002/unstable-api`,
        tileApi: tileApi || `//api.gbif${localEnvironmentPostFix}.org/v1/map/density/tile.png`,
        basemapTileApi: basemapTileApi || `//tile.gbif${localEnvironmentPostFix}.org`,
        identityApi: identityApi || `//api.gbif${localEnvironmentPostFix}.org/v1/`,
        analyticsImg: analyticsImg || `www.gbif${localEnvironmentPostFix}.org/sites/default/files/gbif_analytics/`,
        // domain: 'http://www.gbif.org:7000',
        domain: 'http://localhost:3000',
        topDomain: `gbif${localEnvironmentPostFix}.org`,
        grscicollDomain: `https://grscicoll.hp.gbif${localEnvironmentPostFix}.org`,
        // notice the mock credentials will not work and shouldn't.
        // We still have private endpoints (such as the directory) this is unfortunate as it means outside users can only develop on a small part of the site.
        credentials: credentials || (rootPath + '/config/mockCredentials.json'),
        redirects: redirects || (rootPath + '/config/mockRedirects.json'),
        spamTerms: spamTerms || (rootPath + '/config/mockSpam.txt'),
        verification: verification || (rootPath + '/app/models/verification/sample'),
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || `http://cms-search.gbif${localEnvironmentPostFix}.org:9200/`,
        registry: registry || `https://registry.gbif${localEnvironmentPostFix}.org`,
        elk: elk || '//private-logs.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '36e5ccd0-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi:  'http://blast.gbif-dev.org', //'http://localhost:9001',
        graphQL: `http://graphql.gbif${localEnvironmentPostFix}.org/graphql`,
        reactComponents: `//react-components.gbif${localEnvironmentPostFix}.org/lib/gbif-react-components.js`,
        healthUpdateFrequency: 240000,
        checklistMapping: {
            'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c': {
                title: 'GBIF Backbone',
                colDatasetKey: '53147'
            },
            '7ddf754f-d193-4cc9-b351-99906754a03b': {
                title: 'Catalogue of Life',
                colDatasetKey: '308651'
            }
        },
        defaultChecklist: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
        newGbifOrg: `https://demo.gbif${localEnvironmentPostFix}.org`,

    },
    lab: {
        productionSite: false,
        env: env,
        root: rootPath,
        app: {
            name: 'portal - lab'
        },
        port: port || 80,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif-lab.org/',
        dataApiV2: dataApiV2 || '//api.gbif-lab.org/v2/',
        dataApi: dataApi || '//api.gbif-lab.org/v1/',
        registryApi: registryApi || `//registry-api.gbif-lab.org/`,
        sourceArchive: sourceArchive || `//source-archive.gbif-lab.org/`,
        graphQLApi: graphQLApi || `//graphql.gbif-lab.org/graphql`,
        webUtils: webUtils || `//graphql.gbif-lab.org/unstable-api`,
        tileApi: tileApi || '//api.gbif-lab.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif-lab.org',
        identityApi: identityApi || '//api.gbif-lab.org/v1/',
        analyticsImg: analyticsImg || 'tools.gbif-lab.org/sites/default/files/gbif_analytics/',
        domain: 'https://tools.gbif-lab.org',
        topDomain: 'gbif-lab.org',
        grscicollDomain: `https://grscicoll.hp.gbif-lab.org`,
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-lab.org:9200/',
        registry: registry || 'https://registry.gbif-lab.org',
        elk: elk || '//privatelogs2-vh.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '36e5ccd0-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif-lab.org/graphql',
        reactComponents: '//react-components.gbif-lab.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency,
        checklistMapping: {
            '7ddf754f-d193-4cc9-b351-99906754a03b': {
                title: 'Catalogue of Life',
                colDatasetKey: '308651'
            },
            'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c': {
                title: 'GBIF Backbone',
                colDatasetKey: '53147'
            }
        },
        defaultChecklist: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'
    },
    dev: {
        productionSite: false,
        env: env,
        root: rootPath,
        app: {
            name: 'portal - dev'
        },
        port: port || 80,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif-dev.org/',
        dataApiV2: dataApiV2 || '//api.gbif-dev.org/v2/',
        dataApi: dataApi || '//api.gbif-dev.org/v1/',
        registryApi: registryApi || `//registry-api.gbif-dev.org/`,
        sourceArchive: sourceArchive || `//source-archive.gbif-dev.org/`,
        graphQLApi: graphQLApi || `//graphql.gbif-dev.org/graphql`,
        webUtils: webUtils || `//graphql.gbif-dev.org/unstable-api`,
        tileApi: tileApi || '//api.gbif-dev.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif-dev.org',
        identityApi: identityApi || '//api.gbif-dev.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif-dev.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-dev.org',
        topDomain: 'gbif-dev.org',
        grscicollDomain: `https://grscicoll.hp.gbif-dev.org`,
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-dev.org:9200/',
        registry: registry || 'https://registry.gbif-dev.org',
        elk: elk || '//privatelogs2-vh.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '36e5ccd0-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif-dev.org/graphql',
        reactComponents: '//react-components.gbif-dev.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency,
        checklistMapping: {
            '7ddf754f-d193-4cc9-b351-99906754a03b': {
                title: 'Catalogue of Life',
                colDatasetKey: '308651'
            },
            'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c': {
                title: 'GBIF Backbone',
                colDatasetKey: '53147'
            }
        },
        defaultChecklist: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
        newGbifOrg: `https://demo.gbif${localEnvironmentPostFix}.org`,
    },
    uat: {
        productionSite: false,
        env: env,
        root: rootPath,
        app: {
            name: 'portal - uat'
        },
        port: port || 80,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif-uat.org/',
        dataApiV2: dataApiV2 || '//api.gbif-uat.org/v2/',
        dataApi: dataApi || '//api.gbif-uat.org/v1/',
        registryApi: registryApi || `//registry-api.gbif-uat.org/`,
        sourceArchive: sourceArchive || `//source-archive.gbif-uat.org/`,
        graphQLApi: graphQLApi || `//graphql.gbif-uat.org/graphql`,
        webUtils: webUtils || `//graphql.gbif-uat.org/unstable-api`,
        tileApi: tileApi || '//api.gbif-uat.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif-uat.org',
        identityApi: identityApi || '//api.gbif-uat.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif-uat.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-test.org',
        topDomain: 'gbif-test.org',
        grscicollDomain: `https://grscicoll.hp.gbif-test.org`,
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif-uat.org:9200/',
        registry: registry || 'https://registry.gbif-uat.org',
        elk: elk || '//private-logs.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '782daf00-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif-uat.org/graphql',
        reactComponents: '//react-components.gbif-uat.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency,
        checklistMapping: {
            '7ddf754f-d193-4cc9-b351-99906754a03b': {
                title: 'Catalogue of Life',
                colDatasetKey: '308651'
            },
            'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c': {
                title: 'GBIF Backbone',
                colDatasetKey: '53147'
            }
        },
        defaultChecklist: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
        newGbifOrg: `https://demo.gbif${localEnvironmentPostFix}.org`,
    },

    staging: {
        productionSite: false,
        env: env,
        root: rootPath,
        app: {
            name: 'portal - staging'
        },
        port: port || 80,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif.org/',
        dataApiV2: dataApiV2 || '//api.gbif.org/v2/',
        dataApi: dataApi || '//api.gbif.org/v1/',
        registryApi: registryApi || `//registry-api.gbif.org/`,
        sourceArchive: sourceArchive || `//source-archive.gbif.org/`,
        graphQLApi: graphQLApi || `//graphql.gbif-staging.org/graphql`,
        webUtils: webUtils || `//graphql.gbif-staging.org/unstable-api`,
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif.org',
        identityApi: identityApi || '//api.gbif.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-staging.org',
        topDomain: 'gbif-staging.org',
        grscicollDomain: `https://grscicoll.hp.gbif-staging.org`,
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        registry: registry || 'https://registry.gbif.org',
        elk: elk || '//private-logs.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '24993300-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif-staging.org/graphql',
        reactComponents: '//react-components.gbif-staging.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency,
        checklistMapping: {
            '7ddf754f-d193-4cc9-b351-99906754a03b': {
                title: 'Catalogue of Life',
                colDatasetKey: '308651'
            },
            'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c': {
                title: 'GBIF Backbone',
                colDatasetKey: '53147'
            }
        },
        defaultChecklist: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
        newGbifOrg: `https://demo.gbif${localEnvironmentPostFix}.org`,
    },
    prod: {
        productionSite: true,
        env: env,
        root: rootPath,
        app: {
            name: 'portal - prod'
        },
        port: port || 80,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif.org/',
        dataApiV2: dataApiV2 || '//api.gbif.org/v2/',
        dataApi: dataApi || '//api.gbif.org/v1/',
        registryApi: registryApi || `//registry-api.gbif.org/`,
        sourceArchive: sourceArchive || `//source-archive.gbif.org/`,
        graphQLApi: graphQLApi || `//graphql.gbif.org/graphql`,
        webUtils: webUtils || `//graphql.gbif.org/unstable-api`,
        tileApi: tileApi || '//api.gbif.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif.org',
        identityApi: identityApi || '//api.gbif.org/v1/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif.org',
        topDomain: 'gbif.org',
        grscicollDomain: `https://scientific-collections.gbif.org`,
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        registry: registry || 'https://registry.gbif.org',
        elk: elk || '//private-logs.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '24993300-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif.org/graphql',
        reactComponents: '//react-components.gbif.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency,
        checklistMapping: {
            '7ddf754f-d193-4cc9-b351-99906754a03b': {
                title: 'Catalogue of Life',
                colDatasetKey: '308651'
            },
            'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c': {
                title: 'GBIF Backbone',
                colDatasetKey: '53147'
            }
        },
        newGbifOrg: `https://demo.gbif${localEnvironmentPostFix}.org`,
    },

    test: {
        env: env,
        root: rootPath,
        app: {
            name: 'portal - test'
        },
        port: port || 3000,
        serverProtocol: 'http:',
        apidocs: apidocs,
        managementToolsSite: '//registry.gbif-uat.org/',
        dataApiV2: dataApiV2 || '//api.gbif.org/v2/',
        dataApi: dataApi || '//api.gbif-uat.org/v1/',
        registryApi: registryApi || `//registry-api.gbif-uat.org/`,
        sourceArchive: sourceArchive || `//source-archive.gbif-uat.org/`,
        tileApi: tileApi || '//api.gbif-uat.org/v1/map/density/tile.png',
        basemapTileApi: basemapTileApi || '//tile.gbif.org',
        identityApi: identityApi || '//labs.gbif-uat.org:7003/',
        analyticsImg: analyticsImg || 'www.gbif.org/sites/default/files/gbif_analytics/',
        domain: 'https://www.gbif-test.org',
        topDomain: 'gbif-test.org',
        credentials: credentials || '/etc/portal16/credentials',
        redirects: redirects || '/etc/portal16/redirects',
        spamTerms: spamTerms || ('/etc/portal16/spam.txt'),
        verification: verification || '/var/lib/human-verification/images',
        contentfulApi: contentfulApi || 'https://cdn.contentful.com/',
        contentfulPreviewApi: contentfulPreviewApi || 'https://preview.contentful.com/',
        elasticContentful: elasticContentful || 'http://cms-search.gbif.org:9200/',
        registry: registry || 'https://registry-uat.gbif.org',
        elk: elk || '//private-logs.gbif.org:5601/',
        publicKibana: publicKibana || '//logs.gbif.org/',
        kibanaIndex: kibanaIndex || '782daf00-fdb1-11ea-93de-b97c40066ce8',
        locales: localeConfig.locales,
        defaultLocale: localeConfig.defaultLocale,
        contentfulLocaleMap: localeConfig.localeMappings.contentful,
        publicConstantKeys: publicConstantKeys,
        fbAppId: 1534726343485342,
        userAgent: userAgent,
        blastApi: 'http://blast.gbif-dev.org',
        graphQL: 'http://graphql.gbif-dev.org/graphql',
        reactComponents: '//react-components.gbif-dev.org/lib/gbif-react-components.js',
        healthUpdateFrequency: healthUpdateFrequency,
        checklistMapping: {
            '7ddf754f-d193-4cc9-b351-99906754a03b': {
                title: 'Catalogue of Life',
                colDatasetKey: '308651'
            },
            'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c': {
                title: 'GBIF Backbone',
                colDatasetKey: '53147'
            }
        },
        defaultChecklist: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
        newGbifOrg: `https://demo.gbif${localEnvironmentPostFix}.org`
    }
};

module.exports = Object.freeze(config[env]);
