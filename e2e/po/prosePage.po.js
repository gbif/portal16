'use strict';

var prosePage = function () {
    this.proseInlineImage = element.all(by.css('.prose-columns')).first().element(by.tagName('img'));
};

module.exports = new prosePage();