let fs = require('fs');
let pseudoloc = require('pseudoloc');
let buildConfig = require('../config/build');
let dir = buildConfig.paths.root + '/locales/_build/';
let mockLocale = 'de-CH';
let _ = require('lodash');

let enJson = require(dir + 'en');
let translatedJson = mockify(enJson);

fs.writeFile(dir + mockLocale + '.json', JSON.stringify(translatedJson, null, 2), function(err) {
    if (err) {
        console.log(err);
        throw err;
    }
    console.log('Translation files was succesfully build');
});

function mockify(object) {
    const newObject = _.clone(object);

    _.each(object, (val, key) => {
        if (typeof val === 'string') {
            newObject[key] = getMockText(val);
        } else if (typeof (val) === 'object') {
            newObject[key] = mockify(val);
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
