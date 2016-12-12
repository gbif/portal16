'use strict';

var commonTerms = require('../spec/commonTerms');

describe('Featured term search', function() {

    it('BID should show BID programme as programme', function(){
        browser.get('/');
        element(by.css('#siteSearchInputHome')).sendKeys('bid');
        element(by.css('.search-box a')).click();
        expect(element.all(by.css('.article-card')).count()).toEqual(1);
        expect(element(by.css('.card__content__title')).element(by.tagName('a')).getText()).toBe(commonTerms.bidProjectTitle);
        element(by.css('.card__content__title')).element(by.tagName('a')).click();

        var EC = protractor.ExpectedConditions;
        var inlineImage = element(by.css('.prose-columns')).element(by.tagName('img'));
        browser.wait(EC.presenceOf(inlineImage), 3000);
        expect(inlineImage.getAttribute('complete')).toEqual('true');
    });
});