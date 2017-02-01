'use strict';

/**
 * @fileoverview The CMS API use range to represent limit, and page number for
 * paging, instead of offset. This test ensures the function can correctly
 * convert the combination of limit and offset to range and page number.
 */

let cmsUtilities = require('./cmsUtilities');

describe('TC_Controller_01_CMS_API_Paging_Conversion', function () {
    let paging = {
            'limit': 30,
            'offset': 66,
        },
        result = {
            'range': 30,
            'page': 3
        };

    it('Limit param is converted correctly', function () {
        expect(cmsUtilities.queryTransform(paging).range).toEqual(result.range);
    });
    it('Offset param is converted correctly', function () {
        expect(cmsUtilities.queryTransform(paging).page).toEqual(result.page);
    });
});
