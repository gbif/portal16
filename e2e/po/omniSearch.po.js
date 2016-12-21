'use strict';

var omniSearch = function () {
    this.url = '/search';
    this.articleCards = element.all(by.css('.article-card'));
    this.articleCardTitle = this.articleCards.first().element(by.css('.card__content__title')).element(by.tagName('a'));
};

module.exports = new omniSearch();