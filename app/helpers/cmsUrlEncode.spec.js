'use strict';

/**
 * @fileoverview This test spec is written to test whether regex in cmsUrlEncode
 * module can correctly convert inline image URLs into the prefixed version that
 * is used by image cache, so that the image will show up correctly on the
 * Express front end.
 *
 * The pattern assumes the text has been already escaped and come in from the
 *  API endpoint (JSON), therefore the URLs already starts with
 *  http://cms.gbif-{env}.org/.
 */

let cmsUrlEncode = require('./cmsUrlEncode'),
    apiConfig = require('../models/gbifdata/apiConfig'),
    mock = require('./cmsUrlEncode.mock.json');

describe('TC_03_CMS_Inline_Image_Cache_Link', function () {
    it('Inline image URLs in markdown are converted correctly', function () {
        expect(cmsUrlEncode.extractAndEncodeUriMarkdown(mock.markdownRaw)).toEqual(mock.markdownResult);
    });
    it('Inline image URLs in HTML are converted correctly', function () {
        expect(cmsUrlEncode.extractAndEncodeUriHtml(mock.htmlRaw)).toEqual(mock.htmlResult);
    });
});