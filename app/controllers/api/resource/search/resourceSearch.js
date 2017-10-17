//This module is in need of a cleanup
//has two functions. translate url query simlar to our other APIs into a ES post query. And secondly transform the result into something similar to our APIs results format
const _ = require('lodash'),
    elasticsearch = require('elasticsearch'),
    resourceResultParser = require('./resourceResultParser'),
    contentfulLocaleMap = rootRequire('config/config').contentfulLocaleMap,
    defaultLocale = rootRequire('config/config').defaultLocale,
    elasticContentful = rootRequire('config/config').elasticContentful,
    filterHelper = require('./filter');

let knownFilters = ['year', 'contentType', 'literatureType', 'language', 'audiences', 'purposes', 'topics', 'countriesOfResearcher', 'countriesOfCoverage', 'id', 'identifier', 'searchable', 'homepage', 'keywords', 'gbifDatasetKey', 'publishingOrganizationKey', 'gbifDownloadKey', 'relevance', 'start', 'end', 'peerReview', 'openAccess', 'projectId'],
    defaultContentTypes = ['dataUse', 'literature', 'event', 'news', 'tool', 'document', 'project', 'programme', 'article'];

var pattern = /([\!\*\+\-\=\<\>\&\|\(\)\[\]\{\}\^\~\?\:\\/"])/g;

var client = new elasticsearch.Client({
    host: elasticContentful
});

async function getItem(requestQuery, __, options) {
    let preferedLocale = requestQuery.locale,
        query = buildQuery(requestQuery);

    options = options || {};

    query.requestTimeout = options.requestTimeout || 10000;

    let resp = await client.search(query);

    let parsedResult = resourceResultParser.normalize(resp, query.from, query.size);
    parsedResult.results = resourceResultParser.getLocaleVersion(parsedResult.results, contentfulLocaleMap[preferedLocale], contentfulLocaleMap[defaultLocale]);

    resourceResultParser.addSlug(parsedResult.results, 'title');
    resourceResultParser.addUrl(parsedResult.results);
    resourceResultParser.renderMarkdown(parsedResult.results, ['body', 'summary', 'abstract']);

    return parsedResult;
}

async function search(requestQuery, __, options) {
    let preferedLocale = requestQuery.locale,
        query = buildQuery(requestQuery);

    options = options || {};

    query.requestTimeout = options.requestTimeout || 30000;

    let resp = await client.search(query);

    let parsedResult = resourceResultParser.normalize(resp, query.from, query.size);

    resourceResultParser.removeFields(parsedResult.results, ['gbifDatasetKey', 'publishingOrganizationKey']);
    resourceResultParser.addDOIsToLiterature(parsedResult.results);

    // resourceResultParser.renameField(parsedResult.results, 'literature', 'abstract', 'summary');//rename literature.abcstract to summary for consistency with other content types
    resourceResultParser.renameField(parsedResult.results, 'event', 'description', 'summary');

    //resourceResultParser.selectLocale(parsedResult.results, ['body', 'summary', 'abstract', 'title', 'primaryImage.description', 'primaryImage.file', 'primaryImage.title', 'grantType', 'start', 'end', 'fundsAllocated', 'matchingFunds', 'projectId', 'status', 'location', 'venue', 'primaryLink.url', 'programme.title'], contentfulLocaleMap[preferedLocale], contentfulLocaleMap[defaultLocale]);
    parsedResult.results = resourceResultParser.getLocaleVersion(parsedResult.results, contentfulLocaleMap[preferedLocale], contentfulLocaleMap[defaultLocale]);

    if (!options.rawResponse) {
        resourceResultParser.renderMarkdown(parsedResult.results, ['body', 'summary', 'abstract', 'title']);
        resourceResultParser.stripHtml(parsedResult.results, ['body', 'summary', 'title', 'abstract']);
        resourceResultParser.concatFields(parsedResult.results, ['summary', 'body'], '_summary');
        resourceResultParser.truncate(parsedResult.results, ['title'], 150);
        resourceResultParser.truncate(parsedResult.results, ['body', 'summary', '_summary'], 200);
        resourceResultParser.truncate(parsedResult.results, ['abstract'], 300);
        resourceResultParser.addSlug(parsedResult.results, 'title');
        resourceResultParser.addUrl(parsedResult.results);
        resourceResultParser.transformFacets(parsedResult, __);
        resourceResultParser.addFilters(parsedResult, requestQuery, __);
    }

    return parsedResult;
}

function escapedSearchQuery(q){
    return q.replace(pattern, "\\$1");
}

function buildQuery(query) {
    //facetMultiselect should work
    //facetLimit seems useful per type
    //ignore facet paing for now as we do not use it
    let from = getInteger(query.offset, 0),
        size = getInteger(query.limit, 20),
        facetSize = 20,
        showPastEvents = query._showPastEvents === '' || query._showPastEvents === 'true',
        facetMultiselect = query.facetMultiselect === 'true' || query.facetMultiselect === true,
        body = {
            query: {
                bool: {
                    must: []
                }
            }
        },
        searchParams = {
            from: from,
            size: size
        };

    if (query.q) {
        query.q = escapedSearchQuery(query.q);
        _.set(body, 'query.bool.must[0].bool.should[0].query_string.query', query.q);
        _.set(body, 'query.bool.must[0].bool.should[0].query_string.default_operator', 'AND');
        _.set(body, 'query.bool.must[0].bool.should[0].query_string.fields', ['_all']);
        _.set(body, 'query.bool.must[0].bool.should[0].query_string.auto_generate_phrase_queries', true);
        _.set(body, 'query.bool.must[0].bool.should[0].query_string.boost', 100);

        _.set(body, 'query.bool.must[0].bool.should[1].query_string.query', query.q);
        _.set(body, 'query.bool.must[0].bool.should[1].query_string.default_operator', 'AND');
        _.set(body, 'query.bool.must[0].bool.should[1].query_string.fields', ['_all']);
        _.set(body, 'query.bool.must[0].bool.should[1].query_string.boost', 50);

        _.set(body, 'query.bool.must[0].bool.should[2].query_string.query', query.q);
        _.set(body, 'query.bool.must[0].bool.should[2].query_string.default_operator', 'AND');
        _.set(body, 'query.bool.must[0].bool.should[2].query_string.fields', ['_all']);
        _.set(body, 'query.bool.must[0].bool.should[2].query_string.boost', 10);
        _.set(body, 'query.bool.must[0].bool.should[2].query_string.fuzziness', 2);
    } else {
        _.set(body, 'query.bool.must[0].match_all', {});
    }

    if (!query.contentType || defaultContentTypes.indexOf(query.contentType) > -1) {
        _.set(body, 'query.bool.must[1]', showPastEvents ? oldEventOrSomethingElse : newEventOrSomethingElse);
    }

    query.contentType = query.contentType || defaultContentTypes;

    arrayifyParams(query);


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
        } else if (query.contentType == 'literature') {
            body.sort = [
                {
                    "year": {
                        "order": "desc",
                        "missing": "_last",
                        "unmapped_type": "date"
                    },
                    "created": {
                        "order": "desc",
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
                                    "origin": "now",
                                    "scale": "7d",
                                    "decay": 0.75
                                }
                            },
                            "weight": 10
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
    } else {
        body.query = {
            "function_score": {
                "boost": "5",
                "functions": [
                    {
                        "filter": { "match": { "keywords": {"query": query.q } } },
                        "weight": 100
                    },
                    {
                        "filter": { "match": { "title": {"query": query.q } } },
                        "weight": 20
                    }
                ],
                "score_mode": "max",
                query: body.query
            }
        };
    }

    searchParams.body = body;
    searchParams.index = 'content';
    searchParams.body.indices_boost = [
        {literature: 1},
        {'*': 10}
    ];
    //console.log(JSON.stringify(body, null, 4));
    return searchParams;
}

function getInteger(nr, fallbackValue) {
    if (_.isInteger(nr)) {
        return nr;
    } else if (nr === parseInt(nr, 10).toString()) {
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
    if (['year', 'start', 'end'].indexOf(field) != -1) {
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
    buildQuery: buildQuery,
    contentTypes: defaultContentTypes.slice(),
    getItem: getItem
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
                                        "gte": "now"
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
        "lt": "now"
    }
};