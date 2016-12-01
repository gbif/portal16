'use strict';

describe('Occurrence search', function () {
    var searchDrawer, searchOccurrence, occurrenceTable;

    beforeEach(function () {
        searchDrawer = require('./po/searchDrawer.po.js');
        searchOccurrence = require('./po/searchOccurrence.po.js');
        occurrenceTable = require('./po/occurrenceTable.po.js');
    });

    it('should work with free text search', function () {
        browser.get('/');
        browser.get(occurrenceTable.url);
        expect(occurrenceTable.rowEls.count()).toBeGreaterThan(10);

        searchOccurrence.freeText.sendKeys('annelida');
        searchDrawer.apply.click();
        expect(occurrenceTable.rowEls.count()).toBeGreaterThan(10);

        searchOccurrence.freeText.sendKeys('afou247d0shjHGadl35_nonsense');
        searchDrawer.apply.click();
        expect(occurrenceTable.rowEls.count()).toEqual(0);
    });
});

describe('Featured term search', function() {

    it('BID should show BID programme as programme', function(){
        browser.get('/');
        element(by.css('#siteSearchInputHome')).sendKeys('bid');
        element(by.css('.search-bar--home__search')).click();
        expect(element.all(by.css('.article-card')).count()).toEqual(1);
        expect(element(by.css('.card__content__title')).element(by.tagName('a')).getText()).toBe('BID: Biodiversity Information for Development');
        element(by.css('.card__content__title')).element(by.tagName('a')).click();

        var EC = protractor.ExpectedConditions;
        var inlineImage = element(by.css('.prose-columns')).element(by.tagName('img'));
        browser.wait(EC.presenceOf(inlineImage), 3000);
        expect(inlineImage.getAttribute('complete')).toEqual('true');
    });
});
