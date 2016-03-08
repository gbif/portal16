/**
 * version 1.
 * Locked order. Occurrence list independent of species.
 * no country detection
 *
 *
 * version 2.
 * prioritize results based on likelihood. Species should not always be on top.
 *
 * TODO: Retry on error. Do not fail hard. Log errors. Return whatever we have within n seconds
 *
 *
 * @type {exports|module.exports}
 */
var queryString = require('queryString'),
    request = require('request'),
    speciesSearch = require('./species/species'),
    async = require('async');

var types = Object.freeze({
    SPECIES: 0,
    OCCURRENCES: 1
});

var options = {
    endpoints: {
        //drupal: 'http://bko.gbif.org/api/search/{q}',
        occurrences: 'http://api.gbif-dev.org/v1/occurrence/search?'
    }
};

function getData(q, cb) {
    async.parallel([
            function(callback){
                speciesSearch.getSpeciesData(q, callback)
            }
        //    , function(callback){
        //         request(options.endpoints.occurrences + queryString.stringify({q: q, limit: 5}), function(err, response, body) {
        //             if(err) {
        //                 callback(new Error("failed getting something:" + err.message));
        //                 return;
        //             }
        //             callback(null, {
        //                 type: types.OCCURRENCES,
        //                 data: JSON.parse(body)
        //             });
        //         });
        //     }
        ],
        cb
    );
}

function search(q, cb) {
    console.log('SEARCH STRING ' + q);
    getData(q, function(err, results){
        if (err) {
            console.log(err);
        }
        var data = {};
        results.forEach(function(e){
            data[e.key] = e.data;
        });
        cb(data);
    });
}

module.exports = (function(){
    return {
        types: types,
        search: search
    };
})();