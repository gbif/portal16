'use strict';

var homePage = function () {
    this.url = '/';
    this.searchInput = element(by.css('#siteSearchInputHome'));
    this.searchSubmit = element(by.css('#siteSearchInputHome + .search-box__submit'));
};

module.exports = new homePage();