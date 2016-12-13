'use strict';

let cmsUrlEncode = require('./cmsUrlEncode'),
    apiConfig = require('../models/gbifdata/apiConfig'),
    mock = require('./cmsUrlEncode.mock.json');

describe('CMS content formatting', function () {
    it('Image URLs in markdown are converted correctly', function () {
        expect(cmsUrlEncode.extractAndEncodeUriMarkdown(mock.markdownRaw)).toEqual(mock.markdownResult);
    });
    it('Image URLs in HTML are converted correctly', function () {
        expect(cmsUrlEncode.extractAndEncodeUriHtml(mock.htmlRaw)).toEqual(mock.htmlResult);
    });
});