"use strict";
const _ = require('lodash'),
    format = require('../../../../helpers/format'),
    slugify = require("slugify"),
    credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).contentful.gbif,
    request = require('requestretry'),
    querystring = require('querystring'),
    urljoin = require('url-join'),
    md = require('markdown-it')({html: true, linkify: true, typographer: true}),
    changeCase = require('change-case');

//_.mixin({
//    deep: function (obj, mapper) {
//        return mapper(_.mapValues(obj, function (v) {
//            return _.isPlainObject(v) ? _.deep(v, mapper) : v;
//        }));
//    }
//});

module.exports = {
    normalize: normalize,
    stripHtml: stripHtml,
    renderMarkdown: renderMarkdown,
    truncate: truncate,
    selectLocale: selectLocale,
    addSlug: addSlug,
    include: include,
    renameField: renameField,
    concatFields: concatFields
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

        //add facets
        if (_.isObject(result.aggregations)) {
            Object.keys(result.aggregations).forEach(function (key) {
                let counts = _.get(result.aggregations[key], 'counts.buckets') || _.get(result.aggregations[key], 'buckets'),
                facet = {
                    field: changeCase.constantCase(key),
                    counts: counts.map(function(e){
                        return {
                            name: e.key,
                            count: e.doc_count
                        };
                    })
                };
                res.facets.push(facet);
            });
        }
        return res;
    } catch (e) {
        throw e;
    }
}

//might be nice make this recursive so you could specify a property
function stripHtml(results, fieldsPaths){
    results.forEach(function(e){
        fieldsPaths.forEach(function(field){
            let value = _.get(e, field);
            if (_.isString(value)) {
                _.set(e, field, format.removeHtml(value));
            } else if (_.isObject(value)) {
                let transformedValue = _.mapValues(value, function(x){
                    return format.removeHtml(x);
                });
                _.set(e, field, transformedValue);

            }
        });
    });
}

function renderMarkdown(results, fieldsPaths){
    results.forEach(function(e){
        fieldsPaths.forEach(function(field){
            let value = _.get(e, field);
            if (_.isString(value)) {
                _.set(e, field, md.render(value));
            } else if (_.isObject(value)) {
                let transformedValue = _.mapValues(value, function(x){
                    return md.render(x);
                });
                _.set(e, field, transformedValue);

            }
        });
    });
}

function truncate(results, fieldsPaths, length) {
    results.forEach(function(e){
        fieldsPaths.forEach(function(field){
            let value = _.get(e, field);
            if (_.isString(value)) {
                _.set(e, field, value.length < length ? value : value.substring(0, length) + '…');
            } else if (_.isObject(value)) {
                let transformedValue = _.mapValues(value, function(x){
                    return x.length < length ? x : x.substring(0, length) + '…';
                });
                _.set(e, field, transformedValue);
            }
        });
    });
}

function selectLocale(results, fieldsPaths, preferedLanguage, fallbackLanguage) {
    results.forEach(function(e){
        fieldsPaths.forEach(function(field){
            let value = _.get(e, field);
            if (_.isObject(value)) {
                let languageVersion = value[preferedLanguage];
                if (_.isString(languageVersion)) {
                    _.set(e, field, languageVersion);
                } else {
                    languageVersion = value[fallbackLanguage];
                    _.set(e, field, languageVersion ? languageVersion : '');
                }
            }
        });
    });
}

function addSlug(results, field, preferedLanguage, fallbackLanguage) {
    results.forEach(function(e){
        let value = _.get(e, field);
        if (_.isString(value)) {
            e._slug = getSlug(value);
        } else if (_.isObject(value)) {
            let languageVersion = value[preferedLanguage];
            if (_.isString(languageVersion)) {
                e._slug = getSlug(languageVersion);
            } else {
                languageVersion = value[fallbackLanguage] || '';
                e._slug = getSlug(languageVersion);
            }
        }
    });
}

function getSlug(str){
    return slugify(str.toLowerCase().normalize().replace(/[^\w\-]/g, '-'));
}

function renameField(results, type, oldFieldName, newFieldName) {
    results.forEach(function(e){
        if (e.contentType == type) {
            let value = _.get(e, oldFieldName);
            _.set(e, newFieldName, value);
            _.set(e, oldFieldName, undefined);
        }
    });
}

function concatFields(results, fieldsPaths, targetField) {
    results.forEach(function(e){
        let concatString = '';
        fieldsPaths.forEach(function(field){
            let value = _.get(e, field);
            if (_.isString(value)) {
                concatString += value + ' ';
            }
        });
        _.set(e, targetField, concatString);
    });
}

function getLinks(o, links, key){
    links = links || [];
    if (key == 'sys') {
        if (o.linkType == 'Entry' || o.linkType == 'Asset') {
            links.push(o);
        }

        return links;
    }
    if (_.isObject(o) || _.isArray(o)) {
        _.forEach(o, function(value, key){
            getLinks(value, links, key);
        });
    }
    return links;
}

let typeMap = {
    Entry: 'entries',
    Asset: 'assets'
};

async function include(o) {
    let links = _.uniqBy(getLinks(o), 'id');
    let promiseList = links.map(x => getItemById(x.id, typeMap[x.linkType]));
    let linkedItems = await Promise.all(promiseList);
    linkedItems = _.keyBy(linkedItems, 'sys.id');
    return linkedItems;
}

function getItemById(id, type, isPreview) {
    //let accessToken = isPreview ? credentials.preview_access_token : credentials.access_token,
    let accessToken = 'a069e9b4f1f6430d99a2adfccf8b3f8bc05e24879fcb010c04cd1213abc83561',
        api = isPreview ? 'http://preview.contentful.com' : 'http://cdn.contentful.com',
        //space = credentials.space,
        space = 'njecg2f64y52',
        query = {
            access_token: accessToken
        },
        requestPath = urljoin(api, 'spaces', space, type, id, '?' + querystring.stringify(query));

    let proseRequest = {
        url: requestPath,
        fullResponse: false,
        json: true,
        maxAttempts: 2,
        timeout: 30000,
        method: 'GET'
    };
    return request(proseRequest);
}
