'use strict';

let _ = require('lodash');
let url = require('url');
let doiRegex = require('doi-regex');
let md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: false
});
let linkTemplateTarget = '<a href="%s1" target="%s2">%s3</a>';
let linkTemplate = '<a href="%s1">%s3</a>';

function insertLinks(text, links, target) {
    if (typeof text !== 'string') return '';
    if (_.isEmpty(links) || _.isUndefined(links)) {
        return text.replace(/(\{)/g, '').replace(/(\})/g, '');
    }

    links = _.castArray(links);
    // eslint-disable-next-line no-useless-escape
    let regex = /\{[^\}]*\}/g;
    let matchesLength = _.get(text.match(regex), 'length', 0);
    if (matchesLength !== links.length) {
        return text.replace(/({)/g, '').replace(/(})/g, '');
    }
    let count = 0;
    let template = target ? linkTemplateTarget : linkTemplate;
    let res = text.replace(regex, function(match) {
        let stripped = match.replace(/({)/g, '').replace(/(})/g, '');
        let rewritten = template
            .replace('%s1', links[count])
            .replace('%s2', target)
            .replace('%s3', stripped);
        count++;
        return rewritten;
    });
    return res;
}

function linkify(text) {
    return md.renderInline(text);
}

function reduceUrlToDomain(text) {
    if (_.isString(text)) {
        let parsedUrl = url.parse(text);
        let domain = parsedUrl.hostname;
            return domain;
    } else {
        return '';
    }
}


function getDOILink(text, throwOnMissing) {
    let doi;
    // if string provided then attempt to extract DOI
    if (_.isString(text)) {
        doi = _.get(text.match(doiRegex()), '[0]', undefined);
        if (doi) {
            return 'https://doi.org/' + doi;
        }
    }
    // if not a string of not a DOI
    if (throwOnMissing) {
        throw new Error('The string does not contain a DOI');
    } else {
        return '';
    }
}

function readableDOI(text) {
    let doi;
    // if string provided then attempt to extract DOI
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
    readableDOI: readableDOI,
    reduceUrlToDomain: reduceUrlToDomain
};

// console.log(linkify('replace this mymail@gmail.com and this one thisMail@gbif.org and show a link to http://mysite.com but not to relative ones like this /occurrence/234'));
