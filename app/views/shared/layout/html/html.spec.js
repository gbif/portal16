// var main = require('./test');

// describe("CLIENT", function() {
//    describe("addNumbers", function() {
//        it("should be able to add two numbers", function(){
//            expect(main.increaseNumber(14)).toEqual(15);
//        });
//    });
// });

describe('CLIENT', function() {
    it('contains spec with an expectation', function() {
        expect(true).toBe(true);
    });
});

describe('The \'toEqual\' matcher', function() {
    it('works for simple literals and variables', function() {
        var a = 12;
        expect(a).toEqual(12);
    });

    it('should work for objects', function() {
        var foo = {
            a: 12,
            b: 34
        };
        var bar = {
            a: 12,
            b: 34
        };
        expect(foo).toEqual(bar);
    });
});

