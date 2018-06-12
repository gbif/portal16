let request = require('request');
let config = require('../config/config');
let fs = require('fs');
let _ = require('lodash');
const ENUM_DIR = '../app/models/enums/basic/';
const TRANSLATED_ENUM_DIR = '../locales/translations/en/enums/';
const ENUMS = ['BasisOfRecord', 'ContactType', 'Country', 'DatasetType', 'EndpointType', 'EstablishmentMeans', 'License', 'MediaType', 'OccurrenceIssue', 'Rank', 'TypeStatus'];
/*
Usage: node scripts/generateEnums.js
Does a API lookup for each of the above enums and checks for inconsistency with the portal copy of these (models/enums/basic).
Also checks if a translationKey is missing.
*/

// a few enums has a translation key different from their name
let translationKeys = {
    rank: 'taxonRank',
    contactType: 'role'
};
function firstLetterToLower(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function generateEnums() {
    _.each(ENUMS, function(e) {
        generateEnum(e);
    });
}

function generateEnum(enumName) {
    request('https:' + config.dataApi + 'enumeration/basic/' + enumName, {json: true}, function(error, response, body) {
        if (error) {
            console.log(error);
        }
        let enm = firstLetterToLower(enumName);
        let existingEnum = require(ENUM_DIR + enm);
        // Check if a new key is added, and only update if a missing key is found
        for (let i = 0; i < body.length; i++ ) {
            if (existingEnum.indexOf(body[i]) === -1) {
                console.log('!! New key found: "' + body[i] + '" updating ' + ENUM_DIR + enm + '.json');
                fs.writeFile(__dirname + '/' + ENUM_DIR + enm + '.json', JSON.stringify(body, null, 4), function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log(enm + '.json was saved!');
                });
                break;
            }
        }
        let translationKey = (translationKeys[enm]) ? translationKeys[enm] : enm;
        let translated = require(TRANSLATED_ENUM_DIR + translationKey);        
        for (let i = 0; i < body.length; i++ ) {
            if (!translated[translationKey] || !translated[translationKey].hasOwnProperty(body[i])) {
                console.log('!! Translation missing for "' + body[i] + '" in enums/' + translationKey + '.json');
            }
        }
    });
}


 generateEnums();


