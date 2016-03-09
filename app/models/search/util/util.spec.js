// var rewire = require('rewire'),
//     species = rewire('./species.js');

// species.__set__("confidenceThreshold", 80);
// describe("Species search", function() {

//     it("handles errors", function() {
//         var getConfidentMatchesFromResults = species.__get__("getConfidentMatchesFromResults");
//         expect( getConfidentMatchesFromResults({message: 'error message'}) ).toBeDefined();
//     });

//     it("handles empty results", function() {
//         var getConfidentMatchesFromResults = species.__get__("getConfidentMatchesFromResults");
//         var body = {
//             confidence: 100, 
//             matchType: 'NONE',
//             key: 12
//         };
//         expect( getConfidentMatchesFromResults(null, null, JSON.stringify(body)).matches ).toEqual([]);
//     });

//     it("handles single matches", function() {
//         var getConfidentMatchesFromResults = species.__get__("getConfidentMatchesFromResults");
//         var body = {
//             confidence: 100, 
//             matchType: 'EXACT',
//             key: 12
//         };
//         expect( getConfidentMatchesFromResults(null, null, JSON.stringify(body)).matches ).toEqual([body]);
//     });

//     it("handles multiple matces", function() {
//         var getConfidentMatchesFromResults = species.__get__("getConfidentMatchesFromResults");
//         var includeA = {
//                 confidence: 96,
//                 key: 12
//             },
//             includeB = {
//                 confidence: 94,
//                 key: 13
//             },
//             excludeA = {
//                 confidence: 14,
//                 key: 11
//             };
//         var body = {
//             confidence: 20, 
//             matchType: 'EXACT',
//             alternatives: [includeA, includeB, excludeA]
//         };
//         expect( getConfidentMatchesFromResults(null, null, JSON.stringify(body)).matches ).toEqual( [includeA, includeB] );
//     });
    
// });



