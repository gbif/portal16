'use strict';
var angular = require('angular');
var env = window.gb.env;
var gitCommit = require('./gitCommit');
env.gitCommit = gitCommit.gitCommit;

angular
    .module('portal')
    .constant('env', env)
    .constant('termsVersion', 'dec2018')
    .constant('suggestEndpoints', {
        recordedBy: env.dataApi + 'occurrence/search/recordedBy',
        recordNumber: env.dataApi + 'occurrence/search/recordNumber',
        occurrenceId: env.dataApi + 'occurrence/search/occurrenceId',
        catalogNumber: env.dataApi + 'occurrence/search/catalogNumber',
        institutionCode: env.dataApi + 'occurrence/search/institutionCode',
        collectionCode: env.dataApi + 'occurrence/search/collectionCode',
        datasetName: env.dataApi + 'occurrence/search/datasetName',
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
        publisher: env.dataApi + 'organization/suggest',
        gadm: env.dataApi + 'geocode/gadm/search',
        lifeStage: env.dataApi + 'vocabularies/LifeStage/concepts',
        establishmentMeans: env.dataApi + 'vocabularies/EstablishmentMeans/concepts',
        pathway: env.dataApi + 'vocabularies/Pathway/concepts',
        degreeOfEstablishment: env.dataApi + 'vocabularies/DegreeOfEstablishment/concepts',
        // These does not exist yet
        programme: env.dataApi + 'occurrence/search/programme',
        projectId: env.dataApi + 'occurrence/search/projectId',
        verbatimScientificName: env.dataApi + 'occurrence/search/verbatimScientificName',
        taxonId: env.dataApi + 'occurrence/search/taxonId',
        organismQuantityType: env.dataApi + 'occurrence/search/organismQuantityType',
        sampleSizeUnit: env.dataApi + 'occurrence/search/sampleSizeUnit',
        collectionKey: env.dataApi + 'grscicoll/collection/suggest',
        institutionKey: env.dataApi + 'grscicoll/institution/suggest',
        sex: env.dataApi + 'vocabularies/Sex/concepts',
        typeStatus: env.dataApi + 'vocabularies/TypeStatus/concepts'
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
