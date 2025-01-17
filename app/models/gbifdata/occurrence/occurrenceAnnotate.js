'use strict';
let dataApi = rootRequire('app/models/gbifdata/apiConfig').base.url;
let env = rootRequire('config/config').env;

// the annosys test env do not wotk - and the links on their website lead to dead pages.
// the techincal documentation mostly consist of dead links: https://wiki.bgbm.org/annosys/index.php?title=TechnicalDocumentation
let AnnosysBaseUrl = env === 'prod' ? 'http://annosys.bgbm.fu-berlin.de/AnnoSys/' : 'http://annosys.bgbm.fu-berlin.de/AnnoSysTest/';

// TODO make environment dependent to allow for test annotations?
let config = {
    publisher: {
        'bb646dff-a905-4403-a49b-6d378c2cf0d9': {
            url: '{{references}}',
            keys: ['references'],
            name: 'naturgucker',
            abbrivation: 'na'
        },
        '28eb1a3f-1c15-4a95-931a-4af90ecb574d': {
            url: '{{references}}',
            keys: ['references'],
            name: 'iNaturalist',
            abbrivation: 'iN'
        },
        // issue on https://github.com/gbif/portal-feedback/issues/3088
        'da86174a-a605-43a4-a5e8-53d484152cd3': {
          url: '{{references}}',
          keys: ['references'],
          name: 'Pl@ntNet',
          abbrivation: 'PN'
      },
        '57254bd0-8256-11d8-b7ed-b8a03c50a862': {
            url: AnnosysBaseUrl + 'AnnoSys?recordURL=' + dataApi + 'occurrence/annosys/{{key}}',
            commentsUrl: AnnosysBaseUrl + 'services/records/{{institutionCode}}/{{collectionCode}}/{{catalogNumber}}/annotations',
            allCommentsUrl: AnnosysBaseUrl + 'AnnoSys?recordURL=' + dataApi + 'occurrence/annosys/{{key}}',
            commentsListField: 'annotations',
            commentsCountField: 'size',
            commentTitle: 'motivation',
            commentCreated: 'time',
            commentUrlTemplate: AnnosysBaseUrl + 'AnnoSys?repositoryURI={{repositoryURI}}',
            keys: ['key', 'institutionCode', 'collectionCode', 'catalogNumber', 'repositoryURI'],
            name: 'AnnoSys',
            abbrivation: 'An'
        },
        'ccc2e3ec-98ba-4e74-878d-7dcf0f57baba': {
            url: '{{occurrenceID}}',
            keys: ['occurrenceID'],
            name: 'Danish Mycological Society',
            abbrivation: 'DMS'
        },
        // issue on https://github.com/gbif/portal16/issues/1471
        '7ce8aef0-9e92-11dc-8738-b8a03c50a862': {
          url: 'https://github.com/plazi/community/issues/new?body=Please%20leave%20your%20comment%20here...%0A%0A**Context**%0A%5BGBIF%20occurrence%5D(https%3A%2F%2Fwww.gbif.org%2Foccurrence%2F{{key}})%0A%5BPlazi%20reference%5D({{references}})',
          keys: ['references', 'key'],
          name: 'Plazi',
          abbrivation: 'Pz'
        }
    },
    hostingOrganization: {
        '96710dc8-fecb-440d-ae3e-c34ae8a9616f': { // issue https://github.com/gbif/portal-feedback/issues/5226
            url: '{{references}}',
            keys: ['references'],
            name: 'Symbiota',
            abbrivation: 'Sy'
        }
    },
    installation: {
        '2c733a9d-363d-4d66-9aef-3e0f7bc44bec': { // should still be here as Symbiota is many things https://github.com/gbif/portal-feedback/issues/5226#issuecomment-1983043344
            url: '{{references}}',
            keys: ['references'],
            name: 'Symbiota',
            abbrivation: 'Sy'
        }
    }
};

function getAnnotationUrl(occurrence) {
    if (typeof occurrence === 'undefined') return undefined;

    let publishingOrgKey = occurrence.publishingOrgKey;
    let installationKey = occurrence._installationKey;
    let hostingOrganizationKey = occurrence.hostingOrganizationKey;
    if (typeof publishingOrgKey === 'undefined' && typeof installationKey === 'undefined') return undefined;

    let configTemplate = config.publisher[publishingOrgKey] || config.installation[installationKey] || config.hostingOrganization[hostingOrganizationKey];
    if (typeof configTemplate === 'undefined') return undefined;

    let url = configTemplate.url;
    let commentsUrl = configTemplate.commentsUrl;
    let allCommentsUrl = configTemplate.allCommentsUrl;
    for (let i = 0; i < configTemplate.keys.length; i++) {
        let key = configTemplate.keys[i];
        let val = occurrence[key] || '';
        url = url.replace('{{' + key + '}}', val);
        if (commentsUrl) {
            commentsUrl = commentsUrl.replace('{{' + key + '}}', encodeURIComponent(val));
        }
        if (allCommentsUrl) {
            allCommentsUrl = allCommentsUrl.replace('{{' + key + '}}', encodeURIComponent(val));
        }
    }
    if (url === '') {
      return undefined;
    }
    return {
        url: url,
        abbrivation: configTemplate.abbrivation,
        name: configTemplate.name,
        commentsUrl: commentsUrl,
        commentsListField: configTemplate.commentsListField,
        commentsCountField: configTemplate.commentsCountField,
        commentTitle: configTemplate.commentTitle,
        commentCreated: configTemplate.commentCreated,
        keys: configTemplate.keys,
        commentUrlTemplate: configTemplate.commentUrlTemplate,
        allCommentsUrl: allCommentsUrl
    };
}

module.exports = getAnnotationUrl;
