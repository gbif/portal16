"use strict";
var _ = require('lodash'),
    doiRegex = require('doi-regex'),
    getUrls = require('get-urls');

function getBibliography(bibliography) {
    var bib = bibliography.map(function(e){
        if (_.isString(e.text)) {
            let withoutUrls = e.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''),
                dois = .text.match(doiRegex()),
                urls = getUrls(.text),
                pdfs = urls.filter(function(e){return e.endsWith('pdf')});

            urls = urls.filter(function(e){
                return !e.endsWith('pdf');
            });
            e._query = withoutUrls;
            e.dois = dois;
            e.pdfs = pdfs;

        }
    });
}

function getBib(e) {
    if (_.isString(e.text)) {
        let withoutUrls = e.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''),
            dois = e.text.match(doiRegex()),
            urls = getUrls(e.text),
            pdfs = urls.filter(function(e){return e.endsWith('pdf')});
        
        //remove pdfs as they are already detected
        urls = urls.filter(function(e){
            return !e.endsWith('pdf');
        });
        //remove dois that is already detected
        urls = urls.filter(function(e){
            return !doiRegex().test(e);
        });
        //remove dois that is listed as identifier
        if (_.isString(e.identifier)) {
            dois = dois.filter(function(doi){
                return !e.identifier.endsWith(doi);
            });
        }
        e._query = withoutUrls;
        e.dois = dois;
        e.pdfs = pdfs;
        e.urls = urls;
        return e;
    }
}
getBibliography(biblio[0])

module.exports = {
    getBibliography: getBibliography
};

