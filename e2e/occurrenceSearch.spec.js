'use strict';

describe('Occurrence_Search', function() {
    var searchDrawer, searchOccurrence, occurrenceTable;

    beforeEach(function() {
        searchDrawer = require('./po/searchDrawer.po.js');
        searchOccurrence = require('./po/searchOccurrence.po.js');
        occurrenceTable = require('./po/occurrenceTable.po.js');
    });

    it('should display results for no search filters', function() {
        browser.get(occurrenceTable.url);
        expect(occurrenceTable.rowEls.count()).toBeGreaterThan(10);
    });

    it('should work with free text search', function() {
        browser.get(occurrenceTable.url);
        searchOccurrence.freeText.sendKeys('fungi');
        searchDrawer.apply.click();
        expect(occurrenceTable.rowEls.count()).toBeGreaterThan(10);
    });

    it('should return no results for a nonsense search', function() {
        browser.get(occurrenceTable.url);
        searchOccurrence.freeText.sendKeys('afoud0hjHGadl35_nonsense');
        searchDrawer.apply.click();
        expect(occurrenceTable.rowEls.count()).toEqual(0);
    });
});

