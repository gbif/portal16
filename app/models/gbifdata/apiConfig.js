'use strict';

let baseConfig = require('../../../config/config'),
    clientTileApi = baseConfig.tileApi,
    baseUrl = baseConfig.serverProtocol + baseConfig.dataApi,
    registryApi = baseConfig.serverProtocol + baseConfig.registryApi,
    sourceArchive = 'https:' + baseConfig.sourceArchive,
    registryBaseUrl = baseConfig.serverProtocol + baseConfig.registryApi,
    elk = baseConfig.serverProtocol + baseConfig.elk,
    publicKibana = baseConfig.publicKibana,
    identityBaseUrl = baseConfig.serverProtocol + baseConfig.identityApi;

// TODO Establish URL concatenation policy. Always no trailing slash?
let apiConfig = {
    base: {
        url: baseUrl
    },
    registryBaseUrl: {
        url: registryBaseUrl
    },
    search: {
        url: baseUrl + 'search/'
    },
    country: {
        url: baseUrl + 'node/country/'
    },
    dataset: {
        url: baseUrl + 'dataset/',
        canonical: 'dataset'
    },
    derivedDataset: {
        url: baseUrl + 'derivedDataset/',
        canonical: 'derivedDataset'
    },
    datasetDoi: {
      url: baseUrl + 'dataset/doi/'
  },
    datasetSearch: {
        url: baseUrl + 'dataset/search/'
    },
    crawlingDatasetProcessRunning: {
        url: baseUrl + 'dataset/process/running'
    },
    pipelinesProcessRunning: {
        url: baseUrl + 'pipelines/history/process/running'
    },
    image: {
        url: baseConfig.dataApi + 'image/unsafe/'
    },
    mapCapabilities: {
        url: baseConfig.serverProtocol + baseConfig.dataApiV2 + 'map/occurrence/density/capabilities.json'
    },
    mapOccurrenceDensity: {
        url: baseConfig.serverProtocol + baseConfig.dataApiV2 + 'map/occurrence/density/'
    },
    installation: {
        url: baseUrl + 'installation/'
    },
    network: {
        url: baseUrl + 'network/'
    },
    node: {
        url: baseUrl + 'node/'
    },
    occurrence: {
        url: baseUrl + 'occurrence/'
    },
    occurrenceSearch: {
        url: baseUrl + 'occurrence/search/'
    },
    occurrenceTerm: {
        url: baseUrl + 'occurrence/term/'
    },
    occurrenceInterpretation: {
        url: baseUrl + 'enumeration/interpretationRemark/'
    },
    occurrenceDownloadDataset: {
        url: baseUrl + 'occurrence/download/dataset/'
    },
    occurrenceDownload: {
        url: baseUrl + 'occurrence/download/',
        canonical: 'occurrence/download/'
    },
    occurrenceDownloadRequestValidate: {
        url: baseUrl + 'occurrence/download/request/validate',
    },
    occurrenceDownloadUser: {
        url: baseUrl + 'occurrence/download/user/'
    },
    occurrenceSearchDownload: {
        url: baseUrl + 'occurrence/download/request/',
        canonical: 'occurrence/download/request/'
    },
    occurrenceCancelDownload: {
        url: baseUrl + 'occurrence/download/request/'
    },
    registryOccurrenceDownload: {
        url: registryApi + 'occurrence/download/',
        canonical: 'occurrence/download/'
    },
    publisher: {
        url: baseUrl + 'organization/'
    },
    publisherCreate: {
        url: baseUrl + 'organization/',
        canonical: 'organization/'
    },
    collection: {
        url: baseUrl + 'grscicoll/collection/'
    },
    institution: {
        url: baseUrl + 'grscicoll/institution/'
    },
    grscicollPerson: {
        url: baseUrl + 'grscicoll/person/'
    },
    newsroomWebcal: {

     url: 'webcal:' + baseUrl + 'newsroom/events/'
  //  url: 'webcal://api.gbif-dev.org/v1/'+ 'newsroom/events/'
    },
    newsroom: {
        url: baseUrl + 'newsroom/'

    },
    taxon: {
        url: baseUrl + 'species/'
    },
    taxonRoot: {
        url: baseUrl + 'species/root/'
    },
    taxonSearch: {
        url: baseUrl + 'species/search/'
    },
    taxonMatch: {
        url: baseUrl + 'species/match'
    },
    directoryParticipants: {
        url: baseUrl + 'directory/participant?limit=300'
    },
    directoryParticipant: {
        url: baseUrl + 'directory/participant/'
    },
    directorySecretariat: {
        url: baseUrl + 'directory/report/11?format=json'
    },
    directoryNode: {
        url: baseUrl + 'directory/node/'
    },
    directoryPerson: {
        url: baseUrl + 'directory/person/'
    },
    directoryNodePerson: {
        url: baseUrl + 'directory/node_person/'
    },
    directoryParticipantPerson: {
        url: baseUrl + 'directory/participant_person/'
    },
    directoryPersonRole: {
        url: baseUrl + 'directory/person_role?limit=100'
    },
    directoryCommittee: {
        url: baseUrl + 'directory/committee/'
    },
    directoryReport: {
        url: baseUrl + 'directory/report/'
    },
    countryEnumeration: {
        url: baseUrl + 'enumeration/country'
    },
    user: {
        url: identityBaseUrl + 'user',
        canonical: 'user'
    },
    userCreate: {
        url: identityBaseUrl + 'admin/user/',
        canonical: 'admin/user/'
    },
    userAdmin: {
        url: identityBaseUrl + 'admin/user/',
        canonical: 'admin/user/'
    },
    userConfirm: {
        url: identityBaseUrl + 'admin/user/confirm',
        canonical: 'admin/user/confirm'
    },
    userLogin: {
        url: identityBaseUrl + 'user/login'
    },
    userLogout: {
        url: identityBaseUrl + 'user/logout'
    },
    userResetPassword: {
        url: identityBaseUrl + 'admin/user/resetPassword',
        canonical: 'admin/user/resetPassword'
    },
    userUpdateForgottenPassword: {
        url: identityBaseUrl + 'admin/user/updatePassword',
        canonical: 'admin/user/updatePassword'
    },
    userChallengeCodeValid: {
        url: identityBaseUrl + 'admin/user/confirmationKeyValid',
        canonical: 'admin/user/confirmationKeyValid'
    },
    userChangePassword: {
        url: identityBaseUrl + 'user/changePassword',
        canonical: 'user/changePassword'
    },
    userChangeEmail: {
        url: identityBaseUrl + 'admin/user/changeEmail',
        canonical: 'admin/user/changeEmail'
    },
    userFind: {
        url: identityBaseUrl + 'admin/user/find',
        canonical: 'admin/user/find'
    },
    clientTileApi: {
        url: clientTileApi
    },
    cookieNames: {
        userSession: 'USER_SESSION'
    },
    citesName: {
        url: 'http://api.speciesplus.net/api/v1/taxon_concepts.json'
    },
    dwcextensions: {
        url: 'http://gbrds.gbif.org/registry/extensions.json'
    },
    openTreeOfLife: {
        url: 'https://api.opentreeoflife.org/v3/'
    },
    elkSearch: {
        url: elk + 'elasticsearch/'
    },
    publicKibana: {
        url: publicKibana + '/elasticsearch/_search?'
    },
    blast: {
        url: baseConfig.blastApi
    },
    graphQL: {
      url: baseConfig.graphQL
    },
    validator: {
        url: baseUrl + 'validation',
        canonical: baseUrl + 'validation'
    },
    sourceArchive: {
        url: sourceArchive
    }
};

module.exports = Object.freeze(apiConfig);
