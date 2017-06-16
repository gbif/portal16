'use strict';
var angular = require('angular'),
    env = require('./env');

angular
    .module('portal')
    .constant('env', {
        dataApiV2: env.dataApiV2,
        dataApi: env.dataApi,
        tileApi: env.tileApi,
        cmsApi: env.cmsApi,
        cmsProxy: env.cmsProxy,
        analyticsImg: env.analyticsImg,
        imageCache: env.imageCache,
        mapCapabilities: env.mapCapabilities
    })
    .constant('suggestEndpoints', {
        recordedBy: env.dataApi + 'occurrence/search/recordedBy',
        recordNumber: env.dataApi + 'occurrence/search/recordNumber',
        occurrenceId: env.dataApi + 'occurrence/search/occurrenceId',
        catalogNumber: env.dataApi + 'occurrence/search/catalogNumber',
        institutionCode: env.dataApi + 'occurrence/search/institutionCode',
        collectionCode: env.dataApi + 'occurrence/search/collectionCode',
        organismId: env.dataApi + 'occurrence/search/organismId',
        locality: env.dataApi + 'occurrence/search/locality',
        waterBody: env.dataApi + 'occurrence/search/waterBody',
        stateProvince: env.dataApi + 'occurrence/search/stateProvince',
        taxon: env.dataApi + 'species/suggest',
        dataset: env.dataApi + 'dataset/suggest',
        publisher: env.dataApi + 'organization/suggest'
    }).constant('token', {
    }).constant('BUILD_VERSION',
        gb.buildVersion
    ).constant('LOCALE',
        gb.locale
    );