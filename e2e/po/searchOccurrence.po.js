'use strict';

var searchOccurrence = function () {
    this.freeText = element(by.model('occurrence.freeTextQuery'));
};

module.exports = new searchOccurrence();