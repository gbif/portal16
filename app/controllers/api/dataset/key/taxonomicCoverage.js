'use strict';
let _ = require('lodash'),
    ranks = require('../../../../models/enums/allEnums').rank;

function getTaxonList(list, rank) {
    let filtered = _.filter(list, function(o) {
        return _.get(o, 'rank.interpreted') == rank;
    });
    let sorted = _.sortBy(filtered, ['scientificName']);
    return sorted;
}

function parseTaxonomicCoverage(taxonomicCoverage) {
    let groupedByRank = {};
    ranks.forEach(function(rank) {
        let sortedRank = getTaxonList(taxonomicCoverage.coverages, rank);
        if (sortedRank.length > 0) {
            groupedByRank[rank] = sortedRank;
        }
    });

    return ranks.map(function(rank) {
        return {
            taxa: groupedByRank[rank],
            rank: rank
        };
    }).filter(function(e) {
        return !_.isEmpty(e.taxa);
    });
}

function addUknownRankToUnkown(coverages) {
    return coverages.map(function(e) {
        if (!_.has(e, 'rank.interpreted')) {
            e.rank = {
                interpreted: 'UNKNOWN'
            };
        }
        return e;
    });
}

function extendTaxonomicCoverages(taxonomicCoverages) {
    taxonomicCoverages.forEach(function(taxonomicCoverage) {
        if (_.isEmpty(taxonomicCoverage.coverages)) {
            delete taxonomicCoverage.coverages;
        } else {
            taxonomicCoverage.coverages = addUknownRankToUnkown(taxonomicCoverage.coverages);
            taxonomicCoverage._ranks = parseTaxonomicCoverage(taxonomicCoverage);
        }
    });
    return _.filter(taxonomicCoverages, function(e) {
        return !_.isEmpty(e);
    });
}

module.exports = {
    extendTaxonomicCoverages: extendTaxonomicCoverages
};
