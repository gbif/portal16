"use strict";

var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    // chai = require('chai'),
    // expect = chai.expect,
    // querystring = require('querystring'),
    // request = require('requestretry'),
    // _ = require('lodash'),
    authOperations = require('../../auth/gbifAuthRequest');

module.exports = {
    create: create
};

async function create(body) {
    console.log(body);
    return {};
    // let options = {
    //     method: 'POST',
    //     body: body,
    //     url: apiConfig.publisherCreate.url,
    //     canonicalPath: apiConfig.publisherCreate.canonical
    // };
    // console.log(options);
    // let response = await authOperations.authenticatedRequest(options);
    // console.log(response);
    // if (response.statusCode !== 201) {
    //     throw response;
    // }
    //
    // return response.body;
}