'use strict';

var commonTerms = require('../spec/commonTerms');

describe('Featured term search', function() {
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