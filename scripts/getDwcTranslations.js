let rp = require('request-promise');
let xml2js = require('xml2js');
let parser = new xml2js.Parser();
let _ = require('lodash');
let fs = require('fs');
let Promise = require('bluebird');
Promise.promisifyAll(parser);
let mkdirp = require('mkdirp');
const termsEndpoint = 'http://api.gbif.org/v1/occurrence/term';
/*
Usage: node scripts/getDwcTranslations.js
Looks up translations for all DwcTerms given by the termsEndPoint and produces a directory of json files in scipts/dwcterms
*/

async function getTranslation(term) {
    let wikidata = await rp({url: 'https://terms.tdwg.org/w/api.php?action=query&format=json&export=true&titles=dwc:' + term, method: 'GET', json: true});

    return parser.parseStringAsync(wikidata.query.export['*']).then(function(res) {
        let matches;
        try {
            matches = res.mediawiki.page[0].revision[0].text[0]._.match(/\{\{([^}]+)\}\}/g);
            let translations = _.filter(_.map(matches, function(m) {
                return m.split('|');
            }), function(e) {
                return e[0] === '{{Concept translation\n';
            });
            let mapped = [];
            let en = _.filter(_.map(matches, function(m) {
                return m.split('|');
            }), function(e) {
                return e[0] === '{{Concept\n';
            })[0];
            if (en) {
                let labelEn = _.find(en, function(e) {
                    return e.split('=')[0] === 'label';
                }).split('=')[1].split('\n')[0];
                let definitionEn = _.find(en, function(e) {
                    return e.split('=')[0] === 'definition';
                }).split('=')[1].split('\n')[0];

                mapped.push({locale: 'en', label: labelEn, definition: definitionEn});
            }


            for (let i = 0; i < translations.length; i++) {
                let locale = _.find(translations[i], function(e) {
                    return e.split('=')[0] === 'language';
                }).split('=')[1].split('\n')[0];
                let label = _.find(translations[i], function(e) {
                    return e.split('=')[0] === 'label';
                }).split('=')[1].split('\n')[0];
                let definition = _.find(translations[i], function(e) {
                    return e.split('=')[0] === 'definition';
                }).split('=')[1].split('\n')[0];

                mapped.push({locale: locale, label: label, definition: definition});
            }
            return mapped;
        } catch (err) {
            console.log('No translations found for ' + term);
            return [];
        }
    })
        .catch(function(err) {
            console.log(err);
        });
}


async function compileTranslations() {
    let languages = {};
    let dwcTerms = await rp({url: termsEndpoint, method: 'GET', json: true}).then(function(terms) {
        return _.filter(terms, function(t) {
            return t.source === 'DwcTerm';
        });
    });


    let promises = [];
    _.each(dwcTerms, function(t) {
        promises.push(getTranslation(t.simpleName)
            .then(function(trans) {
                if (trans) {
                    for (let i = 0; i < trans.length; i++) {
                        if (!languages[trans[i].locale]) {
                            languages[trans[i].locale] = {};
                        }
                        languages[trans[i].locale][t.simpleName] = {label: trans[i].label, definition: trans[i].definition};
                    }
                }
            })
            .catch(function(err) {
                console.log('Error with key: ' + t.simpleName);
                console.log(err);
            }));
    });

    Promise.all(promises).then(function() {
        _.each(languages, function(val, key) {
            mkdirp(__dirname + '/dwcterms/' + key, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    fs.writeFile(__dirname + '/dwcterms/' + key + '/dwcterms.json', JSON.stringify(val, null, 4), function(err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log(key + '/dwcterms.json was saved!');
                    });
                    let ocurrenceFieldNames = {ocurrenceFieldNames: {}};
                    _.each(languages[key], function(v, k) {
                        ocurrenceFieldNames.ocurrenceFieldNames[k] = v.label;
                    });
                    fs.writeFile(__dirname + '/dwcterms/' + key + '/ocurrenceFieldNames.json', JSON.stringify(ocurrenceFieldNames, null, 4), function(err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log(key + '/ocurrenceFieldNames.json was saved!');
                    });
                }
            });
        });
    })
        .catch(function(err) {
            console.log(err);
        });
}

compileTranslations();
