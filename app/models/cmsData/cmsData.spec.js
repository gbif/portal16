'use strict';

/**
 * @fileoverview This addresses #67 which for various issues from the API end
 * the Express side couldn't render the facet correctly.
 *
 * The test here verifies the structure of the facet object so the front end
 * will always have correct data to render and to find translation terms.
 */

let cmsData = require('./cmsData');
let mock = require('./cmsDataFacets.mock.json');

describe('TC_Model_02_CMS_Search_Facet_Integrity', function () {
    it('Can verify all facets has correct enum and key', function () {
        expect(cmsData.verifyCmsFacets(mock.valid)).toBe(true);
    });
    it('Can inform if any enum or key is missing in the facets', function () {
        expect(cmsData.verifyCmsFacets(mock.inValid)).toBe(false);
    });
});