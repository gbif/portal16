'use strict';

var searchOccurrence = function () {
	browser.get('/occurrence/search');
    this.freeText = element(by.model('occurrence.occurrenceState.query.q'));
};

module.exports = new searchOccurrence();