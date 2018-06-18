let fs = require('fs');
let pseudoloc = require('pseudoloc');
let buildConfig = require('../config/build');
let dir = buildConfig.paths.root + '/locales/_build/';
let mockLocale = 'de-CH';
let _ = require('lodash');

let enJson = require(dir + 'en');
let translatedPaths = [
    'menu.',
    'search.',
    'datasetSearch.',
    'publisherSearch.',
    'filters.',
    'filterNames.',
    'speciesSearch.',
    'resourceSearch.'
];
let translatedJson = mockify(enJson);

fs.writeFile(dir + mockLocale + '.json', JSON.stringify(translatedJson, null, 2), function(err) {
    if (err) {
        console.log(err);
        throw err;
    }
    console.log('Translation files was succesfully build');
});

function mockify(object, path) {
    const newObject = _.clone(object);

    _.each(object, (val, key) => {
        if (typeof val === 'string') {
            if (isTranslatedKey(path + key)) {
                newObject[key] = getMockText(val);
            } else {
                newObject[key] = val;
            }
        } else if (typeof (val) === 'object') {
            let nestedPath = path ? path + key + '.' : key + '.';
            newObject[key] = mockify(val, nestedPath);
        }
    });
    return newObject;
}

function getMockText(str) {
    if ((str.indexOf('{') !== -1 ) || (str.indexOf('%s') !== -1)) {
        return '[[[!' + str + '!]]]';
    } else {
        return pseudoloc.str(str);
    }
}

function isTranslatedKey(path) {
    let index = _.findIndex(translatedPaths, function(e) {
        return _.startsWith(path, e);
    });
    if (index >= 0) {
        return true;
    }
    return false;
}
