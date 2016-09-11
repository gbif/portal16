'use strict';

//@mgh should we choose either underscore or lodash?
var _ = require('underscore');

function getCuratedCmsContents(q, data) {
    if (typeof q === 'undefined' || typeof data === 'undefined') {
        return;
    }
    if (data.cms && data.cms.results && data.cms.results.length > 0) {
        var featuredContents = [];
        for (let i = 0; i < data.cms.results.length; i++) {
            if (Array.isArray(data.cms.results[i].featuredSearchTerms) && data.cms.results[i].featuredSearchTerms.length > 0) {
                data.cms.results[i].featuredSearchTerms.forEach(function(term){
                    if (term.name.toLowerCase() == q) {
                        var highlighted_item = data.cms.results.splice(i, 1);
                        featuredContents.push(highlighted_item[0]);
                    }
                });
            }
        }
        data.cms.displayedCount = featuredContents.length + 3;
        return featuredContents;
    }
}

function getHighlights(q, data) {
    if (typeof q === 'undefined' || typeof data === 'undefined') {
        return [];
    }
    let highlights = [],
        curatedCmsContents = getCuratedCmsContents(q, data);

    if (data.country) {
        highlights.push({
            type: 'COUNTRY',
            highlight: data.country
        });
    }

    if (curatedCmsContents) {
        highlights.push({
            type: 'CMS',
            highlight: curatedCmsContents
        });
    }

    if (data.catalogNumberOccurrences && data.catalogNumberOccurrences.count > 0) {
        highlights.push({
            type: 'CATALOGNR',
            highlight: data.catalogNumberOccurrences.results[0]
        });
    }

    //in case the api call for getting extended species info fails, then map the initial data to the array so we can show the user what we have
    //the api call for a more detailed species description failed. Just show the default info returned from the match api
    if (_.isArray(data.taxaMatches)) {
        data.taxaMatches = data.taxaMatches.map(function (e, i) {
            if (typeof e.errorType !== 'undefined') {
                data.rawTaxaMatches[i].key = data.rawTaxaMatches[i].usageKey;
                return {
                    info: data.rawTaxaMatches[i],
                    errorType: e.errorType
                }
            } else {
                return e;
            }
        });
    }

    if (_.isArray(data.taxaMatches)) {
        highlights.push({
            type: 'SPECIES',
            highlight: data.taxaMatches
        });
    }

    if (q.toString().toLowerCase() == 'puma concolor') {
        highlights.push({
            type: 'DEVELOPER'
        });
    }
    return highlights;
}

module.exports = {
    getHighlights: getHighlights
};
