"use strict";
let dataApi = rootRequire('app/models/gbifdata/apiConfig').base.url;

//TODO make environment dependent to allow for test annotations?
var config = {
    publisher: {
        '28eb1a3f-1c15-4a95-931a-4af90ecb574d': {
            url: "{{occurrenceID}}",
            keys: ['occurrenceID'],
            name: "iNaturalist",
            abbrivation: "iN"
        },
        '57254bd0-8256-11d8-b7ed-b8a03c50a862': {
            url: "https://annosys.bgbm.fu-berlin.de/AnnoSys/AnnoSys?recordURL=" + dataApi + "occurrence/annosys/{{key}}",
            keys: ['key'],
            name: "AnnoSys",
            abbrivation: "An"
        }
    },
    installation: {
        '2c733a9d-363d-4d66-9aef-3e0f7bc44bec': {
            url: "{{references}}",
            keys: ['references'],
            name: "Symbiota",
            abbrivation: "Sy"
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
    for (var i = 0; i < configTemplate.keys.length; i++) {
        let key = configTemplate.keys[i];
        let val = occurrence[key] || '';
        url = url.replace('{{' + key + '}}', val);
    }
    return {
        url: url,
        abbrivation: configTemplate.abbrivation,
        name: configTemplate.name
    };
}

module.exports = getAnnotationUrl;
