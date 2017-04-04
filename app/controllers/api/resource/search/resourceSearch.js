//has two functions. translate url query simlar to our other APIs into a ES post query. And secondly transform the result into something similar to our APIs results format
const _ = require('lodash');

let knownFilters = ['year', 'contentType', 'type', 'language', 'vocabularyPurpose', 'vocabularyTopic', 'vocabularyDataUse', 'countryOfResearcher', 'countryOfCoverage'];
//knownFilters = knownFilters.map(function(e){return e + '.keyword'});

function buildQuery(query){
    //facetMultiselect should work
    //facetLimit seems useful per type
    //ignore facet paing for now as we do not use it
    let from = getInteger(query.offset, 0),
        size = getInteger(query.limit, 20),
        facetMultiselect = query.facetMultiselect === 'true' || query.facetMultiselect === true;

    arrayifyParams(query);

    let body = {};

    //add free text query to query
    if (query.q) {
        _.set(body, 'query.bool.must[0].query_string.query', query.q)
    }

    //not facet filters should simply be added to the query filters.
    let notFactedFilters = getNotFacetedFilters(query);
    notFactedFilters.forEach(function(filter){
        body.query = body.query || {};
        addToFilter(body.query, filter, query[filter]);
    });

    //faceted filters must be added as post filters, but only if multiselect and have facets and filters
    let factedFilters = getFacetedFilters(query);
    if (!facetMultiselect) {
        factedFilters.forEach(function(filter){
            body.query = body.query || {};
            addToFilter(body.query, filter, query[filter]);
        });
    }

    //add facets if any
    if (query.facet.length > 0) {
        body.aggregations = body.aggregations || {};
        //if no filters then add simple facets without filters
        if (!facetMultiselect || factedFilters.length == 0) {
            query.facet.forEach(function(facet){
                body.aggregations[facet] = {terms: {field: facet}};
            });
        } else {

            //faceted filters must be added as post filters, but only if multiselect and have facets and filters
            factedFilters.forEach(function(filter){
                body.post_filter = body.post_filter || {};
                addToFilter(body.post_filter, filter, query[filter]);
            });

            //Create object with all faceted filters so they can be added individually
            var facetedTermFilters = {};
            factedFilters.forEach(function(filter){
                facetedTermFilters[filter] = getFilter(filter, query[filter]);
            });


            query.facet.forEach(function(filter){
                var allOtherFilters = getAggregationFilter(facetedTermFilters, filter);
                body.aggregations[filter] = {
                    filter: {
                        bool: {
                            filter: allOtherFilters
                        }
                    },
                    aggregations: {
                        counts: {
                            terms: {field: filter}
                        }
                    }
                };
            });
        }
    }

    let searchParams = {
        from: from,
        size: size,
        body: body
    };
    return searchParams;
}

function getInteger(nr, fallbackValue){
    if (nr === parseInt(nr, 10).toString()) {
        return parseInt(nr, 10);
    } else {
        return fallbackValue;
    }
}

function getAggregationFilter(filterTerms, excludedKey) {
    var filteredTerms = [];
    Object.keys(filterTerms).forEach(function(key){
    console.log(excludedKey);
        if (key != excludedKey) {
            filteredTerms.push(filterTerms[key]);
        }
    });
    return filteredTerms;
}

function addToFilter(filter, field, value){
    let operator = 'must';
    //of no value provided then ignore
    if (value.length > 0) {
        //of no operator array of that type created then create a new array
        if (!_.get(filter, 'bool.' + operator + '[0]')) {
            _.set(filter, 'bool.' + operator, []);
        }

        //Create the term filter
        filter.bool[operator].push(getFilter(field, value));
    }
}

function getFilter(field, value) {
    //Create the term filter
    let filterTerm = {};
    if (value.length == 1) {
        let term = {};
        term[field] = value[0];
        _.set(filterTerm, 'term', term);
    } else {
        let term = {};
        term[field] = value;
        _.set(filterTerm, 'terms', term);//value is an array with multiple values
    }
    return filterTerm;
}

function getNotFacetedFilters(query) {
    return knownFilters.filter(function(filterName){
        let isFilterInQuery = !_.isUndefined(query[filterName]),
            isFilterFaceted = _.includes(query.facet, filterName);
        return isFilterInQuery && !isFilterFaceted;
    });
}

function getFacetedFilters(query) {
    return knownFilters.filter(function(filterName){
        let isFilterInQuery = !_.isUndefined(query[filterName]),
            isFilterFaceted = _.includes(query.facet, filterName);
        return isFilterInQuery && isFilterFaceted;
    });
}

function arrayifyParams(query) {
    knownFilters.forEach(function(filter){
        if (!_.isUndefined(query[filter])) {
            query[filter] = arrayify(query[filter]);
        }
    });
    query.facet = arrayify(query.facet);
    return query;
}

function arrayify(value) {
    if (_.isUndefined(value)) return [];
    if (_.isArray(value)) return value;
    return [value];
}

module.exports = {
    buildQuery: buildQuery
};
//var q = {q: 'data', "vocabularyDataUse": 'Science use', countryOfCoverage: ['US', 'DE'], facet: ['countryOfCoverage', 'vocabularyDataUse', 'vocabularyTopic'], facetMultiselect: true};
//
//console.log(JSON.stringify(buildQuery(q), null, 4));



/*
IDEA FOR HOW TO STRUCTURE THIS QUERY BUILDER
q goes to a must clause always if there
everything else is filters

if not multifaceted or not a facet then add to a filter clause

if a faceted and filtered param then create
1 all the filters that are also faceted
2 a map for each faceted filter holding all other faceted filters. (so if filter and faceting on year, country and author there will be a filter with [year, country], [year, author], [country, author]

all filters are one of
 {
    "term": {"year": 2015}
 },
 {
     "terms": {
        "authors_country": ["DE", "US"]
     }
 }
 //we ignore range for years for now. since there is so few years selecting by checkbox seems easier for the user anyhow

 for facets that aren't filtered already simply add as aggregator with all faceted filters.

 add post filter with all facet filters
 */

