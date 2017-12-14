'use strict';

describe('E2E_01_Occurrence_Search', function () {
    var searchDrawer, searchOccurrence, occurrenceTable;

    beforeEach(function () {
        searchDrawer = require('./po/searchDrawer.po.js');
        searchOccurrence = require('./po/searchOccurrence.po.js');
        occurrenceTable = require('./po/occurrenceTable.po.js');
    });

    it('should work with free text search', function () {
        //browser.executeScript("sauce:context=Go to search page");
        browser.get(occurrenceTable.url);
        //browser.executeScript("sauce:context=Asserting than there are results for no search");
        expect(occurrenceTable.rowEls.count()).toBeGreaterThan(10);

        //browser.executeScript("sauce:context=search for 'Annelida'");
        searchOccurrence.freeText.sendKeys('annelida');
        searchDrawer.apply.click();
        //browser.executeScript("sauce:context=Asserting that there should be at lest 10 results for a 'Annelida'");
        expect(occurrenceTable.rowEls.count()).toBeGreaterThan(10);

        //browser.executeScript("sauce:context=search for nonsense string 'afou247d0shjHGadl35_nonsense'");
        searchOccurrence.freeText.sendKeys('afou247d0shjHGadl35_nonsense');
        searchDrawer.apply.click();
        //browser.executeScript("sauce:context=Asserting that there should be 0 results for a 'nonsense search'");
        expect(occurrenceTable.rowEls.count()).toEqual(0);
    });
});

