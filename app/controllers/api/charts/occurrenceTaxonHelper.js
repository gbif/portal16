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

async function getMostFrequentTaxa(filter, percentage) {
    //get n most frequent taxa for each major rank
    percentage = _.toSafeInteger(Math.max(Math.min(100, percentage), 1));
    let facetLimit = _.toSafeInteger(100/percentage);
    let facetPromises = rankKeys.map(function(e){
    //let facetPromises = ['taxonKey'].map(function(e){
        return getExpandedFacets(_.merge({}, filter, {facet: e, facetLimit: facetLimit, limit: 0}), percentage)
    });
    let facetResults = await Promise.all(facetPromises);

    //let facetResults = test;
    return {
        tree: buildTree(facetResults)
    };
}

async function getExpandedFacets(query, percentage) {
    let result = await getData(query);
    //prune before resolving. no need to ask for things we will throw away anyhow
    prune(result.facets[0], result.count, percentage);
    //expand facets to their full objects
    let facets = await facetHelper.expandFacets(result.facets, undefined, true);
    let facet = facets[0];
    facet.totalCount = result.count;
    return facet;
}

function prune(facet, total, percentage) {
    let minimum = _.toSafeInteger(total * (percentage/100));
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
                    treeItem.scientificName = item[rank];
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

let test = [
    {
        "field": "KINGDOM_KEY",
        "counts": [
            {
                "name": "1",
                "count": 6329303,
                "displayName": "Animalia",
                "_resolved": {
                    "key": 1,
                    "nubKey": 1,
                    "nameKey": 13352168,
                    "taxonID": "gbif:1",
                    "kingdom": "Animalia",
                    "kingdomKey": 1,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "scientificName": "Animalia",
                    "canonicalName": "Animalia",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "KINGDOM",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "publishedIn": "Linnæus, Carolus.  1758. Systema naturae per regna tria naturae, secundum classes, ordines, genera, species, cum characteribus, differentiis, synonymis, locis. Laurentii Salvii, Holmiae [= Stockholm].  Vol. Tomus I,  Editio decima, reformata: i-ii, 1-824.",
                    "numDescendants": 2323575,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T12:05:57.974+0000",
                    "issues": [],
                    "synonym": false
                }
            },
            {
                "name": "6",
                "count": 904939,
                "displayName": "Plantae",
                "_resolved": {
                    "key": 6,
                    "nubKey": 6,
                    "nameKey": 13566757,
                    "taxonID": "gbif:6",
                    "kingdom": "Plantae",
                    "kingdomKey": 6,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "scientificName": "Plantae",
                    "canonicalName": "Plantae",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "KINGDOM",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "numDescendants": 800354,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T13:09:40.175+0000",
                    "issues": [],
                    "synonym": false
                }
            }
        ],
        "totalCount": 7321294
    },
    {
        "field": "PHYLUM_KEY",
        "counts": [
            {
                "name": "44",
                "count": 5590439,
                "displayName": "Chordata",
                "_resolved": {
                    "key": 44,
                    "nubKey": 44,
                    "nameKey": 2429952,
                    "taxonID": "gbif:44",
                    "sourceTaxonKey": 114963077,
                    "kingdom": "Animalia",
                    "phylum": "Chordata",
                    "kingdomKey": 1,
                    "phylumKey": 44,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "daacce49-b206-469b-8dc2-2257719f3afa",
                    "parentKey": 1,
                    "parent": "Animalia",
                    "scientificName": "Chordata",
                    "canonicalName": "Chordata",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "PHYLUM",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "numDescendants": 214992,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T12:06:20.151+0000",
                    "issues": [],
                    "synonym": false
                }
            },
            {
                "name": "7707728",
                "count": 895329,
                "displayName": "Tracheophyta",
                "_resolved": {
                    "key": 7707728,
                    "nameKey": 11335748,
                    "taxonID": "gbif:7707728",
                    "sourceTaxonKey": 114963099,
                    "kingdom": "Plantae",
                    "phylum": "Tracheophyta",
                    "kingdomKey": 6,
                    "phylumKey": 7707728,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "daacce49-b206-469b-8dc2-2257719f3afa",
                    "parentKey": 6,
                    "parent": "Plantae",
                    "scientificName": "Tracheophyta",
                    "canonicalName": "Tracheophyta",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "PHYLUM",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "numDescendants": 693154,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T13:10:57.016+0000",
                    "issues": [],
                    "synonym": false
                }
            },
            {
                "name": "54",
                "count": 708855,
                "displayName": "Arthropoda",
                "_resolved": {
                    "key": 54,
                    "nubKey": 54,
                    "nameKey": 1009885,
                    "taxonID": "gbif:54",
                    "sourceTaxonKey": 114963066,
                    "kingdom": "Animalia",
                    "phylum": "Arthropoda",
                    "kingdomKey": 1,
                    "phylumKey": 54,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "daacce49-b206-469b-8dc2-2257719f3afa",
                    "parentKey": 1,
                    "parent": "Animalia",
                    "scientificName": "Arthropoda",
                    "canonicalName": "Arthropoda",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "PHYLUM",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "numDescendants": 1656048,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T12:11:16.088+0000",
                    "issues": [],
                    "synonym": false
                }
            }
        ],
        "totalCount": 7321294
    },
    {
        "field": "CLASS_KEY",
        "counts": [
            {
                "name": "212",
                "count": 5385650,
                "displayName": "Aves",
                "_resolved": {
                    "key": 212,
                    "nubKey": 212,
                    "nameKey": 1235940,
                    "taxonID": "gbif:212",
                    "sourceTaxonKey": 114963078,
                    "kingdom": "Animalia",
                    "phylum": "Chordata",
                    "kingdomKey": 1,
                    "phylumKey": 44,
                    "classKey": 212,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "daacce49-b206-469b-8dc2-2257719f3afa",
                    "parentKey": 44,
                    "parent": "Chordata",
                    "scientificName": "Aves",
                    "canonicalName": "Aves",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "CLASS",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "publishedIn": "Linnæus, Carolus.  1758. Systema naturae per regna tria naturae, secundum classes, ordines, genera, species, cum characteribus, differentiis, synonymis, locis. Laurentii Salvii, Holmiae [= Stockholm].  Vol. Tomus I,  Editio decima, reformata: i-ii, 1-824.",
                    "numDescendants": 58159,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T12:06:34.431+0000",
                    "issues": [],
                    "synonym": false,
                    "class": "Aves"
                }
            },
            {
                "name": "220",
                "count": 742861,
                "displayName": "Magnoliopsida",
                "_resolved": {
                    "key": 220,
                    "nubKey": 220,
                    "nameKey": 6628031,
                    "taxonID": "gbif:220",
                    "sourceTaxonKey": 123878706,
                    "kingdom": "Plantae",
                    "phylum": "Tracheophyta",
                    "kingdomKey": 6,
                    "phylumKey": 7707728,
                    "classKey": 220,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "7ddf754f-d193-4cc9-b351-99906754a03b",
                    "parentKey": 7707728,
                    "parent": "Tracheophyta",
                    "scientificName": "Magnoliopsida",
                    "canonicalName": "Magnoliopsida",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "CLASS",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "numDescendants": 531125,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T13:16:53.430+0000",
                    "issues": [],
                    "synonym": false,
                    "class": "Magnoliopsida"
                }
            },
            {
                "name": "216",
                "count": 678934,
                "displayName": "Insecta",
                "_resolved": {
                    "key": 216,
                    "nubKey": 216,
                    "nameKey": 5709440,
                    "taxonID": "gbif:216",
                    "sourceTaxonKey": 114963071,
                    "kingdom": "Animalia",
                    "phylum": "Arthropoda",
                    "kingdomKey": 1,
                    "phylumKey": 54,
                    "classKey": 216,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "daacce49-b206-469b-8dc2-2257719f3afa",
                    "parentKey": 54,
                    "parent": "Arthropoda",
                    "scientificName": "Insecta",
                    "canonicalName": "Insecta",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "CLASS",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "publishedIn": "Linnæus, Carolus.  1758. Systema naturae per regna tria naturae, secundum classes, ordines, genera, species, cum characteribus, differentiis, synonymis, locis. Laurentii Salvii, Holmiae [= Stockholm].  Vol. Tomus I,  Editio decima, reformata: i-ii, 1-824.",
                    "numDescendants": 1360064,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T12:11:47.308+0000",
                    "issues": [],
                    "synonym": false,
                    "class": "Insecta"
                }
            }
        ],
        "totalCount": 7321294
    },
    {
        "field": "ORDER_KEY",
        "counts": [
            {
                "name": "729",
                "count": 2783351,
                "displayName": "Passeriformes",
                "_resolved": {
                    "key": 729,
                    "nubKey": 729,
                    "nameKey": 8291655,
                    "taxonID": "gbif:729",
                    "sourceTaxonKey": 123612283,
                    "kingdom": "Animalia",
                    "phylum": "Chordata",
                    "order": "Passeriformes",
                    "kingdomKey": 1,
                    "phylumKey": 44,
                    "classKey": 212,
                    "orderKey": 729,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "7ddf754f-d193-4cc9-b351-99906754a03b",
                    "parentKey": 212,
                    "parent": "Aves",
                    "scientificName": "Passeriformes",
                    "canonicalName": "Passeriformes",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "ORDER",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "numDescendants": 30408,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T12:07:16.281+0000",
                    "issues": [],
                    "synonym": false,
                    "class": "Aves"
                }
            },
            {
                "name": "1108",
                "count": 708299,
                "displayName": "Anseriformes",
                "_resolved": {
                    "key": 1108,
                    "nubKey": 1108,
                    "nameKey": 726237,
                    "taxonID": "gbif:1108",
                    "sourceTaxonKey": 123611428,
                    "kingdom": "Animalia",
                    "phylum": "Chordata",
                    "order": "Anseriformes",
                    "kingdomKey": 1,
                    "phylumKey": 44,
                    "classKey": 212,
                    "orderKey": 1108,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "7ddf754f-d193-4cc9-b351-99906754a03b",
                    "parentKey": 212,
                    "parent": "Aves",
                    "scientificName": "Anseriformes",
                    "canonicalName": "Anseriformes",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "ORDER",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "numDescendants": 812,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T12:07:15.775+0000",
                    "issues": [],
                    "synonym": false,
                    "class": "Aves"
                }
            },
            {
                "name": "797",
                "count": 383504,
                "displayName": "Lepidoptera",
                "_resolved": {
                    "key": 797,
                    "nubKey": 797,
                    "nameKey": 6129398,
                    "taxonID": "gbif:797",
                    "sourceTaxonKey": 124788165,
                    "kingdom": "Animalia",
                    "phylum": "Arthropoda",
                    "order": "Lepidoptera",
                    "kingdomKey": 1,
                    "phylumKey": 54,
                    "classKey": 216,
                    "orderKey": 797,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "daacce49-b206-469b-8dc2-2257719f3afa",
                    "parentKey": 216,
                    "parent": "Insecta",
                    "scientificName": "Lepidoptera",
                    "canonicalName": "Lepidoptera",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "ORDER",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "publishedIn": "Linnæus, Carolus.  1758. Systema naturae per regna tria naturae, secundum classes, ordines, genera, species, cum characteribus, differentiis, synonymis, locis. Laurentii Salvii, Holmiae [= Stockholm].  Vol. Tomus I,  Editio decima, reformata: i-ii, 1-824.",
                    "numDescendants": 339139,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T12:25:11.875+0000",
                    "issues": [],
                    "synonym": false,
                    "class": "Insecta"
                }
            }
        ],
        "totalCount": 7321294
    },
    {
        "field": "FAMILY_KEY",
        "counts": [
            {
                "name": "2986",
                "count": 708248,
                "displayName": "Anatidae",
                "_resolved": {
                    "key": 2986,
                    "nubKey": 2986,
                    "nameKey": 627510,
                    "taxonID": "gbif:2986",
                    "sourceTaxonKey": 123611430,
                    "kingdom": "Animalia",
                    "phylum": "Chordata",
                    "order": "Anseriformes",
                    "family": "Anatidae",
                    "kingdomKey": 1,
                    "phylumKey": 44,
                    "classKey": 212,
                    "orderKey": 1108,
                    "familyKey": 2986,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "7ddf754f-d193-4cc9-b351-99906754a03b",
                    "parentKey": 1108,
                    "parent": "Anseriformes",
                    "scientificName": "Anatidae",
                    "canonicalName": "Anatidae",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "FAMILY",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "numDescendants": 753,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T12:07:15.923+0000",
                    "issues": [],
                    "synonym": false,
                    "class": "Aves"
                }
            },
            {
                "name": "5235",
                "count": 418252,
                "displayName": "Corvidae",
                "_resolved": {
                    "key": 5235,
                    "nubKey": 5235,
                    "nameKey": 2889716,
                    "taxonID": "gbif:5235",
                    "sourceTaxonKey": 123612592,
                    "kingdom": "Animalia",
                    "phylum": "Chordata",
                    "order": "Passeriformes",
                    "family": "Corvidae",
                    "kingdomKey": 1,
                    "phylumKey": 44,
                    "classKey": 212,
                    "orderKey": 729,
                    "familyKey": 5235,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "7ddf754f-d193-4cc9-b351-99906754a03b",
                    "parentKey": 729,
                    "parent": "Passeriformes",
                    "scientificName": "Corvidae",
                    "canonicalName": "Corvidae",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "FAMILY",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "numDescendants": 707,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T12:07:47.548+0000",
                    "issues": [],
                    "synonym": false,
                    "class": "Aves"
                }
            },
            {
                "name": "5242",
                "count": 413583,
                "displayName": "Fringillidae",
                "_resolved": {
                    "key": 5242,
                    "nubKey": 5242,
                    "nameKey": 4520812,
                    "taxonID": "gbif:5242",
                    "sourceTaxonKey": 123612758,
                    "kingdom": "Animalia",
                    "phylum": "Chordata",
                    "order": "Passeriformes",
                    "family": "Fringillidae",
                    "kingdomKey": 1,
                    "phylumKey": 44,
                    "classKey": 212,
                    "orderKey": 729,
                    "familyKey": 5242,
                    "datasetKey": "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c",
                    "constituentKey": "7ddf754f-d193-4cc9-b351-99906754a03b",
                    "parentKey": 729,
                    "parent": "Passeriformes",
                    "scientificName": "Fringillidae",
                    "canonicalName": "Fringillidae",
                    "authorship": "",
                    "nameType": "SCIENTIFIC",
                    "rank": "FAMILY",
                    "origin": "SOURCE",
                    "taxonomicStatus": "ACCEPTED",
                    "nomenclaturalStatus": [],
                    "remarks": "",
                    "publishedIn": "Vigors, Nicholas A.  1825. Observations on the natural affinities that connect the orders and families of birds: togethers with description of a new species of scolopax .. with observations on the anas glocitans of pallas and a description of the female of that species.   14(3): 556-562. Transactions of the Linnean Society of London 14(3): 395-516.",
                    "numDescendants": 1031,
                    "lastCrawled": "2017-02-14T13:42:21.926+0000",
                    "lastInterpreted": "2017-02-14T12:07:28.116+0000",
                    "issues": [],
                    "synonym": false,
                    "class": "Aves"
                }
            }
        ],
        "totalCount": 7321294
    },
    {
        "field": "GENUS_KEY",
        "counts": [],
        "totalCount": 7321294
    },
    {
        "field": "SPECIES_KEY",
        "counts": [],
        "totalCount": 7321294
    }
];