"use strict";
var rewire = require('rewire'),
    contributors = require('./contributors.js'),
    identifiersMock = require('./identifiers.mock.json'),
    citationMock = require('./citationOrder.mock.json');

describe("dataset authors", function () {

    it("can extract contact identifiers", function () {
        identifiersMock.forEach(function (test) {
            expect(contributors.getContactIdentifiers(test.contact)).toEqual(test.expected);
        });
    });

    it("can filter and sort for citations", function () {
        expect(contributors.getContributors(citationMock[0].contacts).all.map(function (e) {
            return e.email[0]
        })).toEqual(citationMock[0].expected);
    });
});
