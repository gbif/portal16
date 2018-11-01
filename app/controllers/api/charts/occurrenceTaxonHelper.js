'use strict';

let _ = require('lodash'),
    facetHelper = require('./expandFacets'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    request = rootRequire('app/helpers/request');

let ranks = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
let rankKeys = ['kingdomKey', 'phylumKey', 'classKey', 'orderKey', 'familyKey', 'genusKey', 'speciesKey'];

module.exports = {
    getMostFrequentTaxa: getMostFrequentTaxa
};

async function getMostFrequentTaxa(filter, percentage, limit) {
    // get n most frequent taxa for each major rank
    let facetLimit = limit || 20;
    if (percentage) {
        percentage = Math.max(Math.min(100, _.toNumber(percentage)), 0.01);
        facetLimit = _.toSafeInteger(100 / percentage);
    }

    // let facetPromises = rankKeys.map(function(e){
    // //let facetPromises = ['taxonKey'].map(function(e){
    //    return getExpandedFacets(_.merge({}, filter, {facet: rankKeys, facetLimit: facetLimit, limit: 0}), percentage)
    // });
    // let facetResults = await Promise.all(facetPromises);
    let q = _.merge({}, filter, {
        facet: rankKeys,
        facetLimit: facetLimit,
        limit: 0
    });
    let result = await getExpandedFacets(q);
    let facetResults = result.facets;
    let flatFacetList = getFlatFacetList(result, percentage, limit);
    return {
        tree: buildTree(flatFacetList),
        facets: facetResults
    };
}

function getFlatFacetList(result, percentage, limit) {
    // decide on a minimum value before pruning. this decision is taken based on the percentage and limit provided
    if (!limit && !percentage) {
        limit = 10;
    }
    percentage = percentage || 100;
    let minimum = result.count * (percentage / 100);

    if (limit) {
        let allFacets = _.concat(...(_.map(result.facets, 'counts')));
        allFacets = _.orderBy(allFacets, ['count'], ['desc']);
        let minimumLimit = _.get(allFacets, '[' + limit + '].count', 0);
        minimum = Math.min(minimumLimit, minimum);
    }

    let flattened = flattenAndPrune(result, minimum);
    return flattened;
}

async function getExpandedFacets(query) {
    let result = await getData(query);
    await facetHelper.expandFacets(result.facets, undefined, true);
    return result;
}

function flattenAndPrune(result, minimum) {
    let flattened = _.concat(..._.map(result.facets, 'counts'));
    _.remove(flattened, function(n) {
        return n.count < minimum;
    });
    return {
        results: flattened,
        totalCount: result.count
    };
}

/**
 * Should return
 * {
 *  key: {key:1, rank:kingdom, displayName:Animalia, percentage: 0.82<optional>, children: {optional and the same as this} }
 * }
 * @param facets
 */
function buildTree(taxons, totalCount) {
    let tree = {};
    taxons.results.forEach(function(taxon) {
        let item = taxon._resolved;
        item._count = taxon.count;
        item.percentage = taxon.count / taxons.totalCount;
        addTaxonToTree(tree, item);
    });
    // make it easier to traverse by mapping to arrays
    childrenToArray(tree);
    return tree.children;
}

function addTaxonToTree(tree, taxon) {
    for (let i = 0; i < ranks.length; i++) {
        let rank = ranks[i];
        let rankKeyField = rank + 'Key';
        let treePath = getTreePath(taxon, rankKeyField);
        let rankKey = taxon[rankKeyField] || 'UNKNOWN';
        let treeItem;

        if (_.has(tree, treePath)) {
            treeItem = _.get(tree, treePath);
        } else {
            treeItem = {};
            _.setWith(tree, treePath, treeItem, Object);
        }

        treeItem.key = rankKey;
        treeItem.canonicalName = treeItem.canonicalName || taxon[rank];
        treeItem.rank = rank.toUpperCase();
        if (rank == taxon.rank.toLowerCase()) {
            treeItem.scientificName = taxon.scientificName;
            treeItem.count = taxon._count;
            treeItem.percentage = taxon.percentage;
            break;
        }
    }
}

function childrenToArray(item) {
    if (item.children) {
        Object.keys(item.children).forEach(function(key) {
            childrenToArray(item.children[key]);
        });
    }
    item.children = _.orderBy(_.values(item.children), 'count', 'desc');
}

function getTreePath(taxon, stopRankKeyField) {
    let treePath = '';
    for (let i = 0; i < rankKeys.length; i++) {
        let rankKeyField = rankKeys[i];
        let key = taxon[rankKeyField] || 'UNKNOWN';

        if (treePath !== '') {
            treePath += '.';
        }
        treePath += `children.${key}`;
        if (rankKeyField === stopRankKeyField) {
            break;
        }
    }
    return treePath;
}

async function getData(query) {
    let options = {
        url: apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query),
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        // TODO log error
        throw 'Internal server error getting data';
    }
    return response.body;
}
