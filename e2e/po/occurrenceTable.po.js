'use strict';

var occurrenceTable = function () {
	this.url = '/occurrence/table';
	this.tableArea = element(by.css('.occurrence-search__table__area'));
    this.tableEl = this.tableArea.element(by.css('table'));
    this.rowEls = this.tableEl.all(by.css('tbody tr'));
};

module.exports = new occurrenceTable();