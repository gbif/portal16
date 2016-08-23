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