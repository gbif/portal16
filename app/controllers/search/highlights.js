"use strict";

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

	if (data.taxaMatches) {
		highlights.push({
			type: 'SPECIES',
			highlight: data.taxaMatches
		});
	}
	return highlights;
}

module.exports = {
	getHighlights: getHighlights
};
