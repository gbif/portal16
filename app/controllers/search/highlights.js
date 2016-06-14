"use strict";

const curatedContent = {
	hard: [
		{
			type: 'datause',
			location: 'http://www.gbif.org/newsroom/uses/stanton-2014',
			keywords: ['license', 'licensing', 'rights']
		}
	]
};
const keywordToResource = {};
curatedContent.hard.forEach(function(e){
	e.keywords.forEach(function(k){
		keywordToResource[k] = e;
	});
});

function getCurated(q, data) {
    return keywordToResource[q];
}

function getHighlights(q, data) {
    
}

module.exports = {
	getCurated: getCurated
};
