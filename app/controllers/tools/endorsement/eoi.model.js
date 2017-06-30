"use strict";

var apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    // chai = require('chai'),
    // expect = chai.expect,
    // querystring = require('querystring'),
    // request = require('requestretry'),
    // _ = require('lodash'),
    authOperations = require('../../auth/gbifAuthRequest');

const DEFAULT_ENDORSING_NODE_KEY = "02c40d2a-1cba-4633-90b7-e36e5e97aba8"; // the GBiF secretariat

module.exports = {
    create: create
};

async function create(body) {

    /*

        TODO: After the post of the new publisher, do posts of each body.contacts and format body.comments to markdown and post it as well
     */



    let org = {
        "endorsingNodeKey": (body.suggestedNodeKey === "other")? DEFAULT_ENDORSING_NODE_KEY  : body.suggestedNodeKey,
        "title": (body.title) ? body.title : "",
  //      "abbreviation": null,
        "description": (body.description) ? body.description :"",
 //       "language": null,
        "email": (body.email) ?  [body.email] : [],
        "phone": (body.phone) ? [body.phone] : [],
        "homepage": (body.homepage) ? [body.homepage] : [],
        "logoUrl": (body.logoUrl) ? body.logoUrl : "",
        "address": (body.address) ? body.address : "",
        "city": (body.city) ? body.city : "",
        "province": (body.province) ? body.province : "",
        "country": (body.country) ? body.country: "",
        "postalCode": (body.postalCode) ? body.postalCode : "",
        "latitude": (body.latitude) ? body.latitude : "",
        "longitude": (body.longitude) ? body.longitude: "" };

    console.log(org);

    return {};


    // let options = {
    //     method: 'POST',
    //     body: org,
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