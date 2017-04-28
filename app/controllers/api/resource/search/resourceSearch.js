//This module is in need of a cleanup
//has two functions. translate url query simlar to our other APIs into a ES post query. And secondly transform the result into something similar to our APIs results format
const _ = require('lodash'),
    elasticsearch = require('elasticsearch'),
    resourceResultParser = require('./resourceResultParser'),
    contentfulLocaleMap = rootRequire('config/config').contentfulLocaleMap,
    defaultLocale = rootRequire('config/config').defaultLocale,
    elasticContentful = rootRequire('config/config').elasticContentful,
    filterHelper = require('./filter');

let knownFilters = ['year', 'contentType', 'literatureType', 'language', 'audiences', 'purposes', 'topics', 'countriesOfResearcher', 'countriesOfCoverage', 'id', 'searchable', 'homepage'],
    defaultContentTypes = ['dataUse', 'literature', 'event', 'news', 'tool', 'document', 'project', 'programme', 'article'];

var client = new elasticsearch.Client({
    host: elasticContentful
});


async function search(requestQuery, __, requestTimeout) {
    let preferedLocale = requestQuery.locale,
        query = buildQuery(requestQuery);

    query.requestTimeout = requestTimeout || 10000;

    let resp = await client.search(query);

    let parsedResult = resourceResultParser.normalize(resp, query.from, query.size);
    // resourceResultParser.renameField(parsedResult.results, 'literature', 'abstract', 'summary');//rename literature.abcstract to summary for consistency with other content types
    resourceResultParser.renameField(parsedResult.results, 'event', 'description', 'summary');

    //resourceResultParser.selectLocale(parsedResult.results, ['body', 'summary', 'abstract', 'title', 'primaryImage.description', 'primaryImage.file', 'primaryImage.title', 'grantType', 'start', 'end', 'fundsAllocated', 'matchingFunds', 'projectId', 'status', 'location', 'venue', 'primaryLink.url', 'programme.title'], contentfulLocaleMap[preferedLocale], contentfulLocaleMap[defaultLocale]);
    parsedResult.results = resourceResultParser.getLocaleVersion(parsedResult.results, contentfulLocaleMap[preferedLocale], contentfulLocaleMap[defaultLocale]);

    resourceResultParser.renderMarkdown(parsedResult.results, ['body', 'summary', 'abstract', 'title']);
    resourceResultParser.stripHtml(parsedResult.results, ['body', 'summary', 'title', 'abstract']);
    resourceResultParser.concatFields(parsedResult.results, ['summary', 'body'], '_summary');
    resourceResultParser.truncate(parsedResult.results, ['title'], 150);
    resourceResultParser.truncate(parsedResult.results, ['body', 'summary', '_summary'], 200);
    resourceResultParser.truncate(parsedResult.results, ['abstract'], 300);
    resourceResultParser.addSlug(parsedResult.results, 'title');
    resourceResultParser.transformFacets(parsedResult, __);

    parsedResult.filters = {};
    return parsedResult;
}

function buildQuery(query) {
    //facetMultiselect should work
    //facetLimit seems useful per type
    //ignore facet paing for now as we do not use it
    let from = getInteger(query.offset, 0),
        size = getInteger(query.limit, 20),
        facetSize = 10,
        showPastEvents = query._showPastEvents === '' || query._showPastEvents === 'true',
        facetMultiselect = query.facetMultiselect === 'true' || query.facetMultiselect === true,
        body = {//always require items to be either searchable (contentful bool field) or type literature (from Mendeley)
            query: {
                bool: {
                    must: [
                        showPastEvents ? oldEventOrSomethingElse : newEventOrSomethingElse
                    ]

                }
            }
        },
        searchParams = {
            from: from,
            size: size
        };


    query.contentType = query.contentType || defaultContentTypes;
    //if (query.contentType == 'event') {
    //    from.index = 'event';
    //}
    arrayifyParams(query);

    //add free text query to query
    if (query.q) {
        _.set(body, 'query.bool.must[1].query_string.query', query.q)
    }

    //not facet filters should simply be added to the query filters.
    let notFactedFilters = getNotFacetedFilters(query);
    notFactedFilters.forEach(function (filter) {
        body.query = body.query || {};
        addToFilter(body.query, filter, query[filter]);
    });
    //only show future events. unless filtering on events and asking for past events

    //faceted filters must be added as post filters, but only if multiselect and have facets and filters
    let factedFilters = getFacetedFilters(query);
    if (!facetMultiselect) {
        factedFilters.forEach(function (filter) {
            body.query = body.query || {};
            addToFilter(body.query, filter, query[filter]);
        });
    }

    //add facets if any
    if (query.facet.length > 0) {
        body.aggregations = body.aggregations || {};
        //if no filters then add simple facets without filters
        if (!facetMultiselect || factedFilters.length == 0) {
            query.facet.forEach(function (facet) {
                body.aggregations[facet] = {terms: {field: facet, size: facetSize}};
            });
        } else {

            //faceted filters must be added as post filters, but only if multiselect and have facets and filters
            factedFilters.forEach(function (filter) {
                body.post_filter = body.post_filter || {};
                addToFilter(body.post_filter, filter, query[filter]);
            });

            //Create object with all faceted filters so they can be added individually
            var facetedTermFilters = {};
            factedFilters.forEach(function (filter) {
                facetedTermFilters[filter] = getFilter(filter, query[filter]);
            });


            query.facet.forEach(function (filter) {
                var allOtherFilters = getAggregationFilter(facetedTermFilters, filter);
                body.aggregations[filter] = {
                    filter: {
                        bool: {
                            filter: allOtherFilters
                        }
                    },
                    aggregations: {
                        counts: {
                            terms: {field: filter, size: facetSize}
                        }
                    }
                };
            });
        }
    }

    //sorting
    if (_.isUndefined(query.q)) {
        if (query.contentType == 'event') {
            body.sort = [
                {
                    "start": {
                        "order": showPastEvents ? "desc" : "asc",
                        "missing": "_last",
                        "unmapped_type": "date"
                    }
                }
            ];
        } else {
            body.query = {
                "function_score": {
                    "functions": [
                        {
                            "gauss": {
                                "createdAt": {
                                    "scale": "10d"
                                }
                            }
                        }
                    ],
                    query: body.query
                }
            };

            //body.sort = [
            //    {
            //        "createdAt": {
            //            "order": "desc",
            //            "missing" : "_last",
            //            "unmapped_type": "date"
            //        }
            //    }
            //];
        }
    }

    searchParams.body = body;
    searchParams.body.indices_boost = {
        literature: 0
        //article: 3
    };

    //console.log(JSON.stringify(body, null, 4));
    return searchParams;
}

function getInteger(nr, fallbackValue) {
    if (nr === parseInt(nr, 10).toString()) {
        return parseInt(nr, 10);
    } else {
        return fallbackValue;
    }
}

function getAggregationFilter(filterTerms, excludedKey) {
    var filteredTerms = [];
    Object.keys(filterTerms).forEach(function (key) {
        if (key != excludedKey) {
            filteredTerms.push(filterTerms[key]);
        }
    });
    return filteredTerms;
}

function addToFilter(filter, field, value) {
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
    let isRange = false;
    if (field == 'year') {
        isRange = true;
    }
    return filterHelper.getFilter(field, value, isRange);
    ////Create the term filter
    //let filterTerm = {};
    //if (value.length == 1) {
    //    let term = {};
    //    term[field] = value[0];
    //    _.set(filterTerm, 'term', term);
    //} else {
    //    let term = {};
    //    term[field] = value;
    //    _.set(filterTerm, 'terms', term);//value is an array with multiple values
    //}
    //return filterTerm;
}

function getNotFacetedFilters(query) {
    return knownFilters.filter(function (filterName) {
        let isFilterInQuery = !_.isUndefined(query[filterName]),
            isFilterFaceted = _.includes(query.facet, filterName);
        return isFilterInQuery && !isFilterFaceted;
    });
}

function getFacetedFilters(query) {
    return knownFilters.filter(function (filterName) {
        let isFilterInQuery = !_.isUndefined(query[filterName]),
            isFilterFaceted = _.includes(query.facet, filterName);
        return isFilterInQuery && isFilterFaceted;
    });
}

function arrayifyParams(query) {
    knownFilters.forEach(function (filter) {
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
    search: search,
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


let newEventOrSomethingElse = {
        bool: {
            "should": [
                {
                    bool: {
                        must: [
                            {
                                "range": {
                                    "start": {
                                        "gte": "now/d"
                                    }
                                }
                            },
                            {
                                "term": {
                                    "contentType": "event"
                                }
                            }
                        ]
                    }
                },
                {
                    "terms": {
                        "contentType": _.filter(defaultContentTypes, function (e) {
                            return e !== 'event'
                        })
                    }
                }
            ]
        }
    },
    oldEventOrSomethingElse = _.cloneDeep(newEventOrSomethingElse);

oldEventOrSomethingElse.bool.should[0].bool.must[0].range = {
    "start": {
        "lt": "now/d"
    }
};