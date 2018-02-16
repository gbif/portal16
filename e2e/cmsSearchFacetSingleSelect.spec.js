'use strict';

/**
 * @fileoverview
 * The CMS API end has a limitation that it doesn't support AND without significant
 * implementation effort. We decided to show only one checked facet each time
 * a filter is selected.
 */

describe('E2E_03_CMS_Search_Single_Select', function() {
    let cmsSearch;

    beforeEach(function() {
        cmsSearch = require('./po/cmsSearch.po.js');
    });

    it('Only one selected filter shows after that filter is selected', function() {
        browser.driver.manage().window().maximize();
        browser.get('/cms/search');
        cmsSearch.facetPurpose.click();

        cmsSearch.purposeFilters.count().then(function(numberOfItems) {
            return Math.floor(Math.random() * numberOfItems) + 1;
        }).then(function(randomNumber) {
            cmsSearch.purposeFilters.get(randomNumber).click();
        });

        expect(cmsSearch.purposeFilters.count()).toEqual(1);
    });
});
