let fs = require('fs');
let pseudoloc = require('pseudoloc');
let Chance = require('chance');
let chance = new Chance();
let buildConfig = require('../config/build');
let dir = buildConfig.paths.root + '/locales/_build/';
let _ = require('lodash');
let koreanString = '한국관광공사에오신것을환영합니다국내최대음란사이트소라넷운영자자진귀국국내최대음란물사이트였던소라넷운영자가운데한명이외국에서도피생활을하다가자진귀국해경찰에구속됐다';
let arabString = 'بسماللهالرحمحيطةبالعملالإعلاميفيمصروكذلكمعاستمرارحجبمحتويالمؤسسةعنالوصولللجمهورقررتإدارةمؤسسةالبديلتعلنإشعارآخرونعتذرلجمهورنرارفيالوضعالاليالبديل٢٢إبريل٢٠١٨';

let enJson = require(dir + 'en');
let translatedPaths = [
    // 'menu.',
    // 'search.',
    // 'datasetSearch.',
    // 'pagination.',
    // 'filters.',
    // 'filterNames.',
    'gbifNetwork.',
    // 'directory.',
    // 'occurrence.',
    // 'ocurrenceFieldNames.',
    // 'metrics.',
    // 'map.',
    'pagination.'
];
let translatedJsonEU = mockify(enJson, undefined, 'de-MOCK');
let translatedJsonAS = mockify(enJson, undefined, 'ko-MOCK');
let translatedJsonME = mockify(enJson, undefined, 'ar-MOCK');

function save(o, name) {
    fs.writeFile(dir + name + '.json', JSON.stringify(o, null, 2), function(err) {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log('Translation files was succesfully build');
    });
}
save(translatedJsonEU, 'de-MOCK');
save(translatedJsonAS, 'ko-MOCK');
save(translatedJsonME, 'ar-MOCK');

function mockify(object, path, language) {
    const newObject = _.clone(object);

    _.each(object, (val, key) => {
        if (typeof val === 'string') {
            if (isTranslatedKey(path + key)) {
                newObject[key] = getMockText(val, language);
            } else {
                newObject[key] = val;
            }
        } else if (typeof (val) === 'object') {
            let nestedPath = path ? path + key + '.' : key + '.';
            newObject[key] = mockify(val, nestedPath, language);
        }
    });
    return newObject;
}

function getMockText(str, language) {
    if ((str.indexOf('{') !== -1 ) || (str.indexOf('%s') !== -1)) {
        return '[[[!' + str + '!]]]';
    } else {
        if (language === 'ko-MOCK') {
            return mockKorean(str);
        } else if (language === 'ar-MOCK') {
            return mockArab(str);
        } else {
            return pseudoloc.str(str);
        }
    }
}

function mockKorean(str) {
    return generateMockString(koreanString, str, 0.7);
}

function mockArab(str) {
    return generateMockString(arabString, str, 1.3);
}

function generateMockString(letters, str, factor) {
    let parts = str.split(' ');
    let s = '';
    parts.forEach(function(e) {
        s += generateMockSection(letters, e, factor) + ' ';
    });
    s.trim();
    return s;
}

function generateMockSection(letters, str, factor) {
    let length = _.toSafeInteger(str.length * factor) + 1;
    let s = '';
    for (let i = 0; i < length; i++) {
        let nr = chance.integer({min: 0, max: letters.length - 1});
        let letter = letters[nr];
        s += letter;
    }
    return s;
}

function isTranslatedKey(path) {
    return true;
    // let index = _.findIndex(translatedPaths, function(e) {
    //     return _.startsWith(path, e);
    // });
    // if (index >= 0) {
    //     return true;
    // }
    // return false;
}
