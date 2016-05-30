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
            url: "https://annosys.bgbm.fu-berlin.de/AnnoSys/AnnoSys?recordURL=http://api.gbif.org/v1/occurrence/annosys/{{key}}",
            keys: ['key'],
            name: "AnnoSys",
            abbrivation: "An"
        }
    }
};

function getAnnotationUrl(occurrence) {
    if (typeof occurrence === 'undefined') return undefined;
    let publishingOrgKey = occurrence.publishingOrgKey;
    if (typeof publishingOrgKey === 'undefined') return undefined;
    let configTemplate = config.publisher[publishingOrgKey];
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