"use strict";

var _ = require('lodash'),
    emailRegex = require('email-regex'),
    urlRegex = require('url-regex'),
    doiRegex = require("doi-regex"),
    Autolinker = require('autolinker'),
    linkTemplateTarget = '<a href="%s1" target="%s2">%s3</a>',
    linkTemplate = '<a href="%s1">%s3</a>';
//anything looking like a internal link /[a-z0-9]*\/[a-z0-9\/]*/ fx occurrence/goes/234

function insertLinks(text, links, target) {
    if (typeof text !== 'string') return '';
    if (_.isEmpty(links) || _.isUndefined(links)) {
        return text.replace(/(\{)/g, '').replace(/(\})/g, '');
    }

    links = _.castArray(links);
    var regex = /\{[^\}]*\}/g;
    var matchesLength = _.get(text.match(regex), 'length', 0);
    if (matchesLength !== links.length) {
        return text.replace(/(\{)/g, '').replace(/(\})/g, '');
    }
    var count = 0;
    var template = target ? linkTemplateTarget : linkTemplate;
    var res = text.replace(regex, function (match) {
        var stripped = match.replace(/(\{)/g, '').replace(/(\})/g, '');
        var rewritten = template
            .replace('%s1', links[count])
            .replace('%s2', target)
            .replace('%s3', stripped);
        count++;
        return rewritten;
    });
    return res;
}

function linkify(text) {
    options = options || {};
    options.newWindow = options.newWindow || false;
    options.phone = options.phone || false;
    return Autolinker.link(text, options);
}

function getDOILink(text, throwOnMissing) {
    var doi;
    //if string provided then attempt to extract DOI
    if (_.isString(text)) {
        doi = _.get(text.match(doiRegex()), '[0]', undefined);
        if (doi) {
            return 'https://doi.org/' + doi;
        }
    }
    //if not a string of not a DOI
    if (throwOnMissing) {
        throw new Error('The string does not contain a DOI');
    } else {
        return '';
    }
}

function readableDOI(text) {
    var doi;
    //if string provided then attempt to extract DOI
    if (_.isString(text)) {
        doi = _.get(text.match(doiRegex()), '[0]', undefined);
        if (doi) {
            return doi;
        }
    }
    return '';
}


module.exports = {
    insertLinks: insertLinks,
    linkify: linkify,
    getDOILink: getDOILink,
    readableDOI: readableDOI
};

//console.log(linkify('replace this mymail@gmail.com and this one thisMail@gbif.org and show a link to http://mysite.com but not to relative ones like this /occurrence/234'));