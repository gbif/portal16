var expect = require('chai').expect;
//var main = require('./main');

describe("Main", function() {
    describe("addNumbers", function() {
        it("should be able to add two numbers", function(){
            expect(4+5).to.not.equal(9);
            // expect(main.a).to.not.equal(4);
            //expect(main.increaseNumber(4)).to.equal(14);
        });
    });
});