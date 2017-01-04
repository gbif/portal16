'use strict';

/**
 * @fileoverview To ensure the feature search term is bringing the target item
 * to the top of the result as a curated one, and then leads to the know page
 * with inline image correctly displayed. This repeats the test flow each time
 * we have a major CMS API update, where BID programme has to be easily found.
 */

var commonTerms = require('../spec/commonTerms');

describe('E2E_02_CMS_Featured_Term_Search', function() {
    var homePage, omniSearch, prosePage;

    beforeEach(function() {
        homePage = require('./po/homePage.po.js');
        omniSearch = require('./po/omniSearch.po.js');
        prosePage = require('./po/prosePage.po.js');
    });

    it('BID should show BID programme as programme', function(){
        browser.get('/');
        homePage.searchInput.sendKeys('bid');
        homePage.searchSubmit.click();
        expect(omniSearch.articleCards.count()).toEqual(1);
        expect(omniSearch.articleCardTitle.getText()).toBe(commonTerms.bidProjectTitle);
        omniSearch.articleCardTitle.click();

        var EC = protractor.ExpectedConditions;
        browser.wait(EC.presenceOf(prosePage.proseInlineImage), 3000);
        expect(prosePage.proseInlineImage.getAttribute('complete')).toEqual('true');
    });
});