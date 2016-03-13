var fs = require('fs');
//var results = require('./1000ApiCalls.json');
var results = require('./1000DrupalTerms.json');
var countries = require('./countries.json');

countries = countries.map(function(e){return e.name.toLowerCase()});
// console.log(countries);

console.log(Object.keys(results).length);

var distribution = {};
var noresults = [];
Object.keys(results).forEach(function(e) {
    //console.log( results[e].length );
    if (results[e].length == 0){
        noresults.push(e);
        console.log(e);
    }
    if (results[e].length >= 1) {
        //console.log(results[e].length + ' ' + e + ' ' + JSON.stringify(results[e]));
        // console.log(results[e].length + ' ' + e);
        // if (countries.indexOf(e.toLowerCase()) != -1) {
        //     console.log('COUNTRY FOUND ' + e);
        // }
    }
    // if (countries.indexOf(e.toLowerCase()) != -1) {
    //     console.log('COUNTRY FOUND ' + e);
    // }
    distribution[results[e].length] = typeof distribution[results[e].length] === 'undefined' ? 1 : distribution[results[e].length]+1;
 });

 console.log(distribution);

 Object.keys(distribution).forEach(function(e) {
    console.log( e + ' : ' + (100*distribution[e]/Object.keys(results).length) );
 });

// console.log(noresults);