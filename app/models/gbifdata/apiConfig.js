"use strict";

var	baseConfig = require('../../../config/config');

var baseUrl = baseConfig.dataApi;
var apiConfig = {
	base: {
		url: baseUrl
	},
	dataset: {
		url: baseUrl + 'dataset/'
	},
	occurrence: {
		url: baseUrl + 'occurrence/'
	},
	publisher: {
		url: baseUrl + 'organization/'
	}
};

module.exports = Object.freeze(apiConfig);