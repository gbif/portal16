var testData = {
    meta: {

    },
    species: {
        confident: true,
        data: {key: 'speciesData'} //map resolution, type specimens,
    },
    occurrences: {
        data: [
            {
                type: 'free/species/?',
                key: 'speciesKey'
            }
        ]
    },
    datasets: {},
    articles: {},
    country: {},
    publishers: {}
};
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

function getApiData(path, propName, callback) {
    var data;
    request(path, function(err, response, body) {
        if(err) {
            console.log('ERROR ' + err.message);
            callback(new Error('Unable to get data from API : ' + err.message));
            return;
        }
        data = JSON.parse(body);
        callback(null, {key: propName, data: data});
    });
}

function getData(q, cb) {
    async.parallel([
            function(callback){
                speciesSearch.getSpeciesData(q, callback)
            },
            function(callback){
                //datasets
                getApiData('http://api.gbif.org/v1/dataset/search?limit=5&q=' + q, 'datasets', callback);
            },
            function(callback){
                //publishers
                getApiData('http://api.gbif.org/v1/organization?limit=5&q=' + q, 'publishers', callback);
            },
            function(callback){
                //publishers
                getApiData('http://www.gbif-dev.org/api/search/' + q, 'articles', callback);
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