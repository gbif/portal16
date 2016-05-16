// 2-digit country code published by ISO.
// This approach should be used for populating translated terms on rs.gbif.org.

'use strict';

// @see http://stackoverflow.com/questions/2332811/capitalize-words-in-string
String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

var xmlParser = require('xml2json'),
    request = require('request'),
    isoCountry = {
        concepts: [],
        getHumanString: function (iso2, lang) {
            // default English
            if (!lang) lang = 'en';

            var matched = '';

            // look for matched identifier and return preferred language version.
            this.concepts.forEach(function(c){
                if (c.identifier == iso2) {
                    c.preferred.forEach(function(prefer){
                        if (prefer.lang == lang) {
                            matched = prefer.title;
                        }
                    });
                }
            });

            // Convert country name to capitalized.
            return matched.toLowerCase().capitalize();
        }
    };

request('http://rs.gbif.org/vocabulary/iso/3166-1_alpha2.xml', function(error, response, body) {
    if (!error && response.statusCode == 200) {
        var result = xmlParser.toJson(body, {
            object: true,
            reversible: false,
            coerce: true,
            sanitize: true,
            trim: true,
            arrayNotation: true
        });
        var concepts = result.thesaurus[0].concept;
        concepts.forEach(function(concept){
            var c = {
                identifier: concept['dc:identifier'],
                preferred: []
            };
            concept.preferred[0].term.forEach(function(term){
                var t = {
                    title: term['dc:title'],
                    lang: term['xml:lang']
                };
                c.preferred.push(t);
            });
            isoCountry.concepts.push(c);
        });
    }
});

module.exports = isoCountry;
