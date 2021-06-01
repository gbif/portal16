'use strict';
let _ = require('lodash'),
    doiRegex = require('doi-regex'),
    getUrls = require('get-urls');

function getBibliography(bibliographicCitations) {
    if (!_.isArray(bibliographicCitations)) bibliographicCitations = [];
    return bibliographicCitations
        .filter(function(e) {
            return !_.isEmpty(e.text);
        }).map(function(e) {
            return getBibliographicReference(e);
        });
}

function getBibliographicReference(ref) {
    try {
      ref.text = ref.text || '';
      let withoutUrls = ref.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''),
          dois = ref.text.match(doiRegex()),
          urls = getUrls(ref.text)
              .filter(function(e) {
                  return !doiRegex().test(e);
              })
              .map(function(e) {
                  return formatUrl(e);
              });
      dois = dois || [];
      dois = dois.map(function(e) {
          return formatDoi(e);
      });

      ref._query = 'https://scholar.google.com/scholar?q=' + encodeURIComponent(withoutUrls);

      let identifiers = [];
      if (_.isString(ref.identifier)) {
          let formated = formatReference(ref.identifier);
          if (formated) {
              identifiers.push(formated);
          }
      }
      identifiers = _.uniqBy(identifiers.concat(dois).concat(urls), 'ref');
      ref._identifiers = identifiers;
      return ref;
    } catch (err) {
      return {
        text: ref.text
      };
    }
}


function formatDoi(doi) {
    return {
        type: 'DOI',
        ref: 'https://doi.org/' + doi,
        text: doi
    };
}

function formatUrl(url) {
    let type = url.endsWith('pdf') ? 'PDF' : 'URL';
    return {
        type: type,
        ref: url,
        text: url
    };
}

function formatISSN(issn) {
    return {
        type: 'ISSN',
        ref: 'http://www.issn.cc/' + issn.replace('ISSN', '').trim(),
        text: issn
    };
}

function formatReference(str) {
    if (_.isEmpty(str)) return false;

    let doi = str.match(doiRegex());
    if (doi && doi.length == 1) {
        return formatDoi(doi[0]);
    } else if (doi && doi.length > 1) {
        return false;
    }

    let url = getUrls(str);
    if (url.length == 1) {
        return formatUrl(url[0]);
    } else if (url.length > 1) {
        return false;
    }

    if (str.startsWith('ISSN')) {
        return formatISSN(str);
    }

    return {
        type: 'STR',
        text: str
    };
}

module.exports = {
    getBibliography: getBibliography
};

