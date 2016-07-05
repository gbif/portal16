"use strict";

var _ = require('underscore');

const curatedArticles = {
	hard: [
		{
			cmsContentId: '82565',
			keywords: ['bear', 'asiatic']
		}
	]
};
const keywordToResource = {};
curatedArticles.hard.forEach(function(e){
	e.keywords.forEach(function(k){
		keywordToResource[k] = e.cmsContentId;
	});
});

function getCuratedArticle(q, data) {
	if (typeof q === 'undefined' || typeof data === 'undefined') {
		return;
	}
	let cmsContentId = keywordToResource[q.toString().toLocaleLowerCase()];
	if (typeof cmsContentId !== 'undefined' && data.articles && data.articles.data && data.articles.data.length > 0) {
		for (let i = 0; i < data.articles.data.length; i++) {
			if (data.articles.data[i].entity_id == cmsContentId) {
				return data.articles.data[i];
			}
		}
	}
}

function getHighlights(q, data) {
	if (typeof q === 'undefined' || typeof data === 'undefined') {
		return [];
	}
	let highlights = [],
		curatedArticle = getCuratedArticle(q, data);

	if (data.country) {
		highlights.push({
			type: 'COUNTRY',
			highlight: data.country
		});
	}

	if (curatedArticle) {
		highlights.push({
			type: 'ARTICLE',
			highlight: curatedArticle
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
