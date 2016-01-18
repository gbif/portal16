// var expect = require('chai').expect;
var main = require('./main');

describe("Main", function() {
    describe("increaseNumber", function() {
        it("should detect malformed JSON strings", function(){
            // expect(4+5).to.not.equal(90);
            // expect(main.a).to.not.equal(4);
            expect(main.increaseNumber(4)).to.equal(14);
        });
    });
});