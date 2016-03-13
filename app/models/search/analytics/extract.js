var fs = require('fs');
var csv = require("fast-csv");
var async = require("async");
var helper = require('./util.js');
var stream = fs.createReadStream("./app/models/search/analytics/ds1000.csv");
 
var results = {};
function getAPIdata(q, callback) {
	console.log(q);
	helper.getApiData('http://api.gbif.org/v1/species/match?verbose=true&name=' + encodeURIComponent(q), function(err, data) {
        if (data) {
            var confidentMatches = helper.getMatchesByConfidence(data);
            results[q] = confidentMatches;
        }
        else {
        	console.log(err);
        }
        callback(err, confidentMatches)
    });
}


function getAll() {
	async.eachSeries(queries, function iterator(item, callback) {
	  	getAPIdata(item, callback);
	}, function done() {
		//console.log(results);
		fs.writeFile('1000DrupalTerms.json', JSON.stringify(results), 'utf8', function(){
			console.log('file written to disc');
		});
	});
}


var queries = [];
var csvStream = csv()
    .on("data", function(data){
         console.log(data[0]);
         queries.push(data[0]);
    })
    .on("end", function(){
         console.log("done");
         //getAll();
    });
 
stream.pipe(csvStream);