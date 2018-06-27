'use strict';
const _ = require('lodash'),
    format = require('../../../../helpers/format'),
    slug = require('slug'),
    md = require('markdown-it')({html: true, linkify: false, typographer: true, breaks: true}),
    changeCase = require('change-case');

md.use(require('markdown-it-video'), {
    youtube: {width: 640, height: 390},
    vimeo: {width: 500, height: 281},
    vine: {width: 600, height: 600, embed: 'simple'},
    prezi: {width: 550, height: 400}
});

module.exports = {
    normalize: normalize,
    stripHtml: stripHtml,
    renderMarkdown: renderMarkdown,
    truncate: truncate,
    selectLocale: selectLocale,
    addSlug: addSlug,
    addUrl: addUrl,
    renameField: renameField,
    concatFields: concatFields,
    transformFacets: transformFacets,
    getLocaleVersion: getLocaleVersion,
    addFilters: addFilters,
    addDOIsToLiterature: addDOIsToLiterature,
    removeFields: removeFields
};

function normalize(result, offset, limit) {
    try {
        let res = {
            offset: offset || 0,
            limit: limit || 20,
            endOfRecords: false,
            count: _.get(result, 'hits.total', 0),
            results: _.get(result, 'hits.hits', []),
            facets: []
        };

        res.results = _.map(res.results, '_source');

        res.endOfRecords = res.offset + res.limit >= res.count;

        // add facets
        if (_.isObject(result.aggregations)) {
            // add total distincts if available
            _.filter(Object.keys(result.aggregations), function(e) {
return _.endsWith(e, '_count');
}).forEach(function(key) {
                let value = _.get(result.aggregations[key], 'value');
                let aggItem = result.aggregations[key.substr(0, key.length - 6)];
                if (!aggItem) {
                    aggItem = {buckets: []};
                    result.aggregations[key.substr(0, key.length - 6)] = aggItem;
                }
                aggItem.cardinality = value;
            });

            Object.keys(result.aggregations).forEach(function(key) {
                let counts = _.get(result.aggregations[key], 'counts.buckets') || _.get(result.aggregations[key], 'buckets');
                let cardinality = _.get(result.aggregations[key], 'cardinality');
                if (counts) {
                    let facet = {
                        field: changeCase.constantCase(key),
                        counts: counts.map(function(e) {
                            return {
                                name: e.key,
                                count: e.doc_count
                            };
                        })
                    };
                    if (cardinality) {
                        facet.cardinality = cardinality;
                    }
                    res.facets.push(facet);
                }
            });
        }
        return res;
    } catch (e) {
        throw e;
    }
}

// might be nice make this recursive so you could specify a property
function stripHtml(results, fieldsPaths) {
    results.forEach(function(e) {
        fieldsPaths.forEach(function(field) {
            let value = _.get(e, field);
            if (_.isString(value)) {
                _.set(e, field, format.decodeHtml(format.removeHtml(value)));
            } else if (_.isObject(value)) {
                let transformedValue = _.mapValues(value, function(x) {
                    return format.decodeHtml(format.removeHtml(x));
                });
                _.set(e, field, transformedValue);
            }
        });
    });
}

function renderMarkdown(results, fieldsPaths) {
    results.forEach(function(e) {
        fieldsPaths.forEach(function(field) {
            let value = _.get(e, field);
            if (_.isString(value) && field !== 'title') {
                _.set(e, field, md.render(value));
            } else if (_.isObject(value)) {
                let transformedValue = _.mapValues(value, function(x) {
                    return md.render(x);
                });
                _.set(e, field, transformedValue);
            }
        });
    });
}

function truncate(results, fieldsPaths, length) {
    results.forEach(function(e) {
        fieldsPaths.forEach(function(field) {
            let value = _.get(e, field);
            if (_.isString(value)) {
                _.set(e, field, value.length < length ? value : value.substring(0, length) + '…');
            } else if (_.isObject(value)) {
                let transformedValue = _.mapValues(value, function(x) {
                    return x.length < length ? x : x.substring(0, length) + '…';
                });
                _.set(e, field, transformedValue);
            }
        });
    });
}

function selectLocale(results, fieldsPaths, preferedLanguage, fallbackLanguage) {
    results.forEach(function(e) {
        fieldsPaths.forEach(function(field) {
            let value = _.get(e, field);
            if (_.isString(value)) {
                return value;
            }
            if (_.isObject(value)) {
                let languageVersion = _.get(value, preferedLanguage, value[fallbackLanguage]);
                if (_.isString(languageVersion)) {
                    _.set(e, field, languageVersion);
                } else {
                    _.set(e, field, languageVersion ? languageVersion : value);
                }
            }
        });
    });
}

function getLocaleVersion(item, preferedLanguage, fallbackLanguage, depth) {
    depth = depth || 0;
    depth++;
    if (depth > 10) {
        return item; // failsafe as well as a sanity measure - don't recurse more than to depth 10
    }
    try {
        if (_.has(item, fallbackLanguage)) {
            // if there is a fallback version, there might also be other translations.
            let languageVersion = _.get(item, preferedLanguage, item[fallbackLanguage]);
            if (_.isString(languageVersion)) {
                return getLocaleVersion(languageVersion, preferedLanguage, fallbackLanguage, depth);
            } else {
                return getLocaleVersion(languageVersion, preferedLanguage, fallbackLanguage, depth);
            }
        } else {
            // not a translated field, but might be an array or object that should be translated
            if (_.isPlainObject(item) && !_.isEmpty(item)) {
                return _.mapValues(item, function(o) {
                    return getLocaleVersion(o, preferedLanguage, fallbackLanguage, depth);
                });
            }
            if (_.isArray(item) && !_.isEmpty(item)) {
                return _.map(item, function(o) {
                    return getLocaleVersion(o, preferedLanguage, fallbackLanguage, depth);
                });
            }
            return item;
        }
    } catch (err) {
        // TODO log error
    }
}

function addSlug(results, field) {
    results.forEach(function(e) {
        let value = _.get(e, field);
        if (_.isString(value)) {
            e._slug = getSlug(value);
        }
    });
}

function addUrl(results) {
    results.forEach(function(e) {
        if (e.urlAlias) {
            e._url = e.urlAlias;
        } else {
            e._url = '/' + changeCase.paramCase(e.contentType ) + '/' + e.id + '/' + e._slug;
        }
    });
}

function getSlug(str) {
    return slug(str.toLowerCase());
}

function renameField(results, type, oldFieldName, newFieldName) {
    results.forEach(function(e) {
        if (e.contentType == type) {
            let value = _.get(e, oldFieldName);
            _.set(e, newFieldName, value);
            _.set(e, oldFieldName, undefined);
        }
    });
}

function concatFields(results, fieldsPaths, targetField) {
    results.forEach(function(e) {
        let concatString = '';
        fieldsPaths.forEach(function(field) {
            let value = _.get(e, field);
            if (_.isString(value)) {
                concatString += value + ' … ';
            }
        });
        _.set(e, targetField, concatString);
    });
}

function addDOIsToLiterature(results) {
    results.forEach(function(e) {
        let tags = _.get(e, 'tags', []);
        let dois = tags.filter(function(e) {
return e.startsWith('gbifDOI:');
}).map(function(e) {
return 'doi:' + e.substr(8);
});
        e._gbifDOIs = dois;
    });
}

function removeFields(results, fieldsPaths) {
    results.forEach(function(e) {
        fieldsPaths.forEach(function(field) {
            delete e[field];
        });
    });
}

function transformFacets(result, __, types) {
    try {
        types = types || ['YEAR', 'CONTENT_TYPE', 'LITERATURE_TYPE', 'LANGUAGE', 'AUDIENCES', 'PURPOSES', 'TOPICS'];
        if (!_.isEmpty(result.facets)) {
            result.facets.forEach(function(facet) {
                facet.counts = facet.counts.map(function(e) {
                    let facetEntry = {
                        name: e.name,
                        title: e.name,
                        count: e.count
                    };
                    if (types.indexOf(facet.field) > -1) {
                        facetEntry.title = __('enums.cms.vocabularyTerms.' + e.name);
                    }
                    return facetEntry;
                });
                facet.counts = _.keyBy(facet.counts, 'name');
            });
            result.facets = _.keyBy(result.facets, 'field');
        }
    } catch (e) {
        // log error
    }
}

function addFilters(results) {
    results.filters = {
        // PURPOSES: [{name: 'test', title: 'hej'}]
    };
}
