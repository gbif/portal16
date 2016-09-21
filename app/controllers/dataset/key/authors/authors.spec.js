"use strict";
var rewire = require('rewire'),
    authors = require('./authors.js'),
    identifiersMock = require('./identifiers.mock.json'),
    citationMock = require('./citationOrder.mock.json');

describe("dataset authors", function() {
    //it("can correctly order them according to standard citations practice", function() {
    //    expect(authors.getCitationOrder('2015-11-17T15:33:41.103+0000')).toEqual('November 17, 2015');
    //});

    it("can extract contact identifiers", function() {
        identifiersMock.forEach(function(test){
            expect(authors.getContactIdentifiers(test.contact)).toEqual(test.expected);
        });
    });

    it("can filter and sort for citations", function() {
        expect(authors.getCitationOrder(citationMock[0].contacts).map(function(e){return e.email[0]})).toEqual(citationMock[0].expected);
    });
});
