'use strict';

let cmsSearch = function() {
    this.url = '/cms/search';
    this.facetPurpose = element(by.id('category_purpose'));
    this.purposeFilters = this.facetPurpose.all(by.css('.checkbox'));
};
module.exports = new cmsSearch();
