'use strict';
var angular = require('angular');
var env = window.gb.env;
var gitCommit = require('./gitCommit');
env.gitCommit = gitCommit.gitCommit;

angular
    .module('portal')
    .constant('env', env)
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
        eventId: env.dataApi + 'occurrence/search/eventId',
        networkKey: '/api/networkKey/suggest',
        installationKey: env.dataApi + 'occurrence/search/installationKey',
        samplingProtocol: env.dataApi + 'occurrence/search/samplingProtocol',
        publisher: env.dataApi + 'organization/suggest'
    }).constant('token', {
    }).constant('BUILD_VERSION',
        gb.buildVersion
    ).constant('constantKeys',
        window.gb.constantKeys
    ).constant('LOCALE',
        window.gb.locale
    ).constant('URL_PREFIX',
        window.gb.urlPrefix
    ).constant('LOCALE_MAPPINGS',
        window.gb.env.localeMappings
    ).constant('LOCALE_2_LETTER',
        window.gb.locale.substr(0, 2)
    ).constant(
        'IS_TOUCH', window.gb.supportsTouch
    ).constant('IS_RTL',
        window.gb.env.localeMappings.rtl[window.gb.locale]
    );
