'use strict';

/**
 * @fileoverview This addresses the situation described at #150 where
 * unpublished items were included in the results for table rendering. Because
 * those items don't have required attributes so rows were rendered
 * inconsistently.
 */

var relatedProjects = require('./programmeValidate.mock.json'),
    relatedProjectsValidate = require('./programmeValidate');

describe('TC_View_01_Project_Table_Integrity', function () {

    it('All related project has grant type assigned', function () {
        expect(relatedProjectsValidate(relatedProjects)).toBe(true);
    });

});