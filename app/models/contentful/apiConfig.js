'use strict';

var baseConfig = require('../../../config/config'),
    contentfulApi = baseConfig.contentfulApi,
    contentfulPreviewApi = baseConfig.contentfulPreviewApi;

// TODO Establish URL concatenation policy. Always no trailing slash?
var apiConfig = {
    preview: {
        url: contentfulPreviewApi
    },
    content: {
        url: contentfulApi
    }
};

module.exports = Object.freeze(apiConfig);
