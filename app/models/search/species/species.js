var queryString = require('queryString'),
    request = require('request'),
    url = require('url'),
    async = require('async');

var types = Object.freeze({
    SPECIES: 0,
    OCCURRENCES: 1
});

var speciesSearch = {
    protocol: "http:",
    host: "api.gbif.org",
    pathname: "v1/species/search"
};

var options = {
    endpoints: {
        speciesSearch: url.format(speciesSearch) + '?',
        speciesMedia: 'http://api.gbif.org/v1/species/'
    }
};

function getSpeciesData(q, callback) {
    var data;
    console.log('getSpeciesData');
    request(options.endpoints.speciesSearch + queryString.stringify({q: q, limit: 2}), function(err, response, body) {
        if(err) {
            callback(new Error("failed getting something:" + err.message));
            return;
        }
        data = JSON.parse(body);
        //data = filterSpeciesData(data); //select which species that we want to show in the ui. For know just parse 2 first.
        augmentSpeciesData(data, callback);
    });
}

function augmentSpeciesData(speciesResults, callback) {
    async.each(speciesResults.results, function(species, cb) {
        var speciesMedia = {
            protocol: "http:",
            host: "api.gbif.org",
            pathname: "v1/species/" + speciesResults.results[0].nubKey + '/media'
        };
        request(url.format(speciesMedia), function(err, response, body) {
            if(err) {
                cb(new Error('Unable to get media data for species :' + speciesResults.results[0].key + '. ' + err.message));
                return;
            }
            species.mediaData = JSON.parse(body);
            cb();
        });
    }, function(err){

        if (err) {
            callback('failed to run async.each');
            return;
        }
        console.log('with media');
        console.log(speciesResults);
        callback(null, {
            type: types.SPECIES,
            data: speciesResults
        });
    });
}



module.exports = (function(){
    return {
        getSpeciesData: getSpeciesData
    };
})();