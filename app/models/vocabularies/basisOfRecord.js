// This approach should be used for populating translated terms on rs.gbif.org.

'use strict';
var xmlParser = require('xml2json'),
    request = require('request'),
    basisOfRecord = {
        concepts: [],
        getHumanString: function (machineName, lang) {
            // default English
            if (!lang) lang = 'en';

            var matched = '';

            // convert machineName to identifier
            var id = machineName.toLowerCase().replace(/_(.)/g, function(m){return m[1].toUpperCase();});
            id = id.charAt(0).toUpperCase() + id.slice(1);

            // look for matched identifier and return preferred language version.
            this.concepts.forEach(function(c){
                if (c.identifier == id) {
                    c.preferred.forEach(function(prefer){
                        if (prefer.lang == lang) {
                            matched = prefer.title;
                        }
                    });
                }
            });

            return matched;
        }
    };

request('http://rs.gbif.org/vocabulary/dwc/basis_of_record.xml', function(error, response, body) {
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
            basisOfRecord.concepts.push(c);
        });

        // Add concepts that are not available on rs.gbif.org but are possible from API.
        // @see https://github.com/gbif/gbif-api/blob/master/src/main/java/org/gbif/api/vocabulary/BasisOfRecord.java
        var additionalConcepts = [
            {
                identifier: 'Literature',
                preferred: [
                    {
                        lang: 'en',
                        title: 'Literature'
                    }
                ]
            },
            {
                identifier: 'Observation',
                preferred: [
                    {
                        lang: 'en',
                        title: 'Observation'
                    }
                ]
            },
            {
                identifier: 'Unknown',
                preferred: [
                    {
                        lang: 'en',
                        title: 'Unknown'
                    }
                ]
            }
        ];
        basisOfRecord.concepts = basisOfRecord.concepts.concat(additionalConcepts);
    }
});

module.exports = basisOfRecord;
