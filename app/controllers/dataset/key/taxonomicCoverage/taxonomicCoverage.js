"use strict";
var _ = require('lodash');

function getTaxonList(list, rank) {
    let sorted = _.filter(list, function(o) { 
        return _.get(o, 'rank.interpreted') == rank; 
    }).map(function(e){
        return e.scientificName;
    }).sort();
    return sorted;
}

function getTaxonomicCoverages(coverages){
    return getTaxonList(coverages, 'SPECIES');
}

module.exports = {
    getTaxonomicCoverages: getTaxonomicCoverages
};

