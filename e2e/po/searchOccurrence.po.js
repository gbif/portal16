'use strict';

var searchOccurrence = function () {
	browser.get('/occurrence/table');
    this.freeText = element(by.model('occurrence.query.q'));
};

module.exports = new searchOccurrence();