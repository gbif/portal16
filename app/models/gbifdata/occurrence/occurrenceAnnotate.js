'use strict';
let dataApi = rootRequire('app/models/gbifdata/apiConfig').base.url;
let env = rootRequire('config/config').env;

let AnnosysBaseUrl = env == 'prod' ? 'https://annosys.bgbm.fu-berlin.de/AnnoSys/' : 'https://annosys.bgbm.fu-berlin.de/AnnoSysTest/';

// TODO make environment dependent to allow for test annotations?
let config = {
    publisher: {
        '28eb1a3f-1c15-4a95-931a-4af90ecb574d': {
            url: '{{references}}',
            keys: ['references'],
            name: 'iNaturalist',
            abbrivation: 'iN'
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
        }
    },
    installation: {
        '2c733a9d-363d-4d66-9aef-3e0f7bc44bec': {
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
    if (typeof publishingOrgKey === 'undefined' && typeof installationKey === 'undefined') return undefined;

    let configTemplate = config.publisher[publishingOrgKey] || config.installation[installationKey];
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
