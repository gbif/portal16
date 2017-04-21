"use strict";

let _ = require('lodash'),
    slugify = require("slugify"),
    request = require('requestretry'),
    urljoin = require('url-join'),
    moment = require('moment'),
    querystring = require('querystring'),
    contentfulLocaleMap = rootRequire('config/config').contentfulLocaleMap,
    credentialsPath = rootRequire('config/config').credentials,
    credentials = require(credentialsPath).contentful.gbif;

module.exports = {
    getSlug: getSlug,
    searchContentful: searchContentful,
    getFirstContentItem: getFirstContentItem,
    mapLegacyData: mapLegacyData,
    removeUnresovable: removeUnresovable
};


function getSlug(str){
    return slugify(str.toLowerCase().normalize().replace(/[^\w\-]/g, '-'));
}

function searchContentful(entryId, depth, isPreview, locale) {
    let accessToken = isPreview ? credentials.preview_access_token : credentials.access_token,
        api = isPreview ? 'http://preview.contentful.com' : 'http://cdn.contentful.com',
        space = credentials.space,
        validLocale = contentfulLocaleMap[locale],
        query = {
            access_token: accessToken,
            include: depth || 1,
            'sys.id': entryId,
            'locale': validLocale
        },
        requestPath = urljoin(api, 'spaces', space, 'entries', '?' + querystring.stringify(query));

    var proseRequest = {
        url: requestPath,
        fullResponse: false,
        json: true,
        maxAttempts: 2,
        timeout: 30000,
        method: 'GET'
    };
    return request(proseRequest);
}

function getFirstContentItem(result) {
    var entry = {};
    entry.main = result.items[0];
    entry.resolved = {};
    if (_.get(result, 'includes.Entry.length', 0) > 0) {
        entry.resolved.Entry = _.keyBy(result.includes.Entry, 'sys.id');
    }
    if (_.get(result, 'includes.Asset.length', 0) > 0) {
        entry.resolved.Asset = _.keyBy(result.includes.Asset, 'sys.id');
    }
    return entry;
}


function removeUnresovable(item, includes) {
    Object.keys(item).forEach(function(key){
        var value = item[key];
        if (_.get(value, 'sys.type') == 'Link') {
            //check if item is included
            let linkType = _.get(value, 'sys.linkType'),
                id =  _.get(value, 'sys.id'),
                resolvedItem = _.get(includes, linkType + '.' + id);
            if (_.isUndefined(resolvedItem)) {
                delete item.key;
            }
        } else if(_.isArray(value)) {
            _.set(item, key, getPrunedList(value, includes));
        }
    });
}

function getPrunedList(list, includes) {
    let prunedList = list.filter(function(e){
        let linkType = _.get(e, 'sys.linkType'),
            id =  _.get(e, 'sys.id');
        //if it isn't a link it cannot be broken, so it isn't eligeble for pruning
        if (_.isUndefined(linkType)) {
            return true;
        }
        let resolvedItem = _.get(includes, linkType + '.' + id);

        //if it cannot be resolved, then it is either in draft or archived. remove the link
        if (_.isUndefined(resolvedItem)) {
            return false;
        }
        return true;
    });
    return _.isEmpty(prunedList) ? undefined : prunedList;
}

function mapLegacyData(item) {
    let creationDateFromDrupal = _.get(item, 'main.fields.meta.drupal.created');
    if (_.isInteger(creationDateFromDrupal)) {
        item.main.sys.createdAt = moment.unix(creationDateFromDrupal).format();
    }
}