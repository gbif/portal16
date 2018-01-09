"use strict";

let i18n = rootRequire("config/i18n"),
    _ = require('lodash'),
    enums = rootRequire('app/models/enums/allEnums'),
    facetHelper = require('./expandFacets'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    request = require('requestretry');

let ranks = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
let rankKeys = ['kingdomKey', 'phylumKey', 'classKey', 'orderKey', 'familyKey', 'genusKey', 'speciesKey'];

module.exports = {
    getMostFrequentTaxa: getMostFrequentTaxa
};

async function getMostFrequentTaxa(filter, percentage, limit) {
    //get n most frequent taxa for each major rank
    let facetLimit = limit || 20;
    if (percentage) {
        percentage = _.toSafeInteger(Math.max(Math.min(100, percentage), 1));
        facetLimit = _.toSafeInteger(100/percentage);
    }

    //let facetPromises = rankKeys.map(function(e){
    ////let facetPromises = ['taxonKey'].map(function(e){
    //    return getExpandedFacets(_.merge({}, filter, {facet: rankKeys, facetLimit: facetLimit, limit: 0}), percentage)
    //});
    //let facetResults = await Promise.all(facetPromises);
    let facetResults = await getExpandedFacets(_.merge({}, filter, {facet: rankKeys, facetLimit: facetLimit, limit: 0}), percentage, limit);

    //return {facetResults};
    return {
        tree: buildTree(facetResults)
    };
}

async function getExpandedFacets(query, percentage, limit) {
    let result = await getData(query);

    //decide on a minimum value before pruning. this decision is taken based on the percentage and limit provided
    if (!limit && !percentage) {
        limit = 10;
    }
    percentage = percentage || 100;
    var minimum = result.count * (percentage/100);

    if (limit) {
        var allFacets = _.concat(...(_.map(result.facets, 'counts')));
        allFacets = _.orderBy(allFacets, ['count'], ['desc']);
        var minimumLimit = _.get(allFacets, '[' + limit + '].count', 0);
        minimum = Math.min(minimumLimit, minimum);
    }

    //prune before resolving. no need to ask for things we will throw away anyhow
    result.facets.forEach(function(e){
        e.totalCount = result.count;
        prune(e, minimum);
    });
    let facets = await facetHelper.expandFacets(result.facets, undefined, true);
    return facets;
}

function prune(facet, minimum) {
    _.remove(facet.counts, function(n){
        return n.count < minimum;
    });
}

/**
 * Should return
 * {
 *  key: {key:1, rank:kingdom, displayName:Animalia, percentage: 0.82<optional>, children: {optional and the same as this} }
 * }
 * @param facets
 */
function buildTree(facets) {
    let tree = {};
    facets.forEach(function(facet){
        facet.counts.forEach(function(taxon){
            let item = taxon._resolved;
            ranks.forEach(function(rank){
                let rankKey = rank + 'Key';
                if (item[rankKey]) {
                    let treePath = getTreePath(item);
                    let treeItem;
                    if (_.has(tree, treePath)) {
                        treeItem = _.get(tree, treePath);
                    } else {
                        treeItem = {};
                        _.setWith(tree, treePath, treeItem, Object)
                    }
                    treeItem.key = item[rankKey];
                    treeItem.canonicalName = item[rank];
                    treeItem.rank = item.rank;
                    if (taxon.count) {
                        treeItem.count = taxon.count;
                        treeItem.percentage = taxon.count/facet.totalCount;
                    }
                }
            });
        });
    });
    //make it easier to traverse by mapping to arrays
    childrenToArray(tree);
    return tree.children;
}

function childrenToArray(item) {
    if (item.children) {
        Object.keys(item.children).forEach(function(key){
            childrenToArray(item.children[key]);
        });
    }
    item.children = _.values(item.children);
}

function getTreePath(taxon){
    let treePath = '';
    rankKeys.forEach(function(rankKey){
        if (taxon[rankKey]) {
            if (treePath !== '') {
                treePath += '.';
            }
            treePath += `children.${taxon[rankKey]}`;
        }
    });
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
        //TODO log error
        throw 'Internal server error getting data';
    }
    return response.body;
}