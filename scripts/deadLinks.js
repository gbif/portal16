"use strict";

let credentials = require('../config/credentials'),
    resourceSearch = require('../app/controllers/api/resource/search/resourceSearch'),
    _ = require('lodash'),
    async = require('async'),
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    getLinks = require('get-md-links'),
    md = require('markdown-it')({ html: true, linkify: true, typographer: true, breaks: true });

md.linkify.tlds('fuzzyLink', false);

async function getContentType(contentType) {
    let q = {
        contentType: contentType,
        limit: 1000
    };
    let results = await resourceSearch.search(q, undefined, { rawResponse: true, requestTimeout: 120000 });

    return results;
}

async function search() {
    console.log('get content');
    let dataUse = await getContentType('dataUse');
    let news = await getContentType('news');
    let tool = await getContentType('tool');
    let event = await getContentType('event');
    let article = await getContentType('article');
    let project = await getContentType('project');
    let programme = await getContentType('programme');
    let document = await getContentType('document');

    console.log('all data recieved');

    let results = dataUse.results
        // .concat(news.results)
        .concat(tool.results)
        .concat(event.results)
        .concat(project.results)
        .concat(programme.results)
        .concat(article.results)
        .concat(document.results);

    let allLinks = [];
    console.log('process results');
    results = _.map(results, function (e) {
        let prunedItem = _.pick(e, ['title', 'id', 'contentType', 'summary', 'body', 'primaryLink', 'secondaryLinks']);
        var links = [];

        let primary = _.get(prunedItem, 'primaryLink.url');
        delete prunedItem.primaryLink;
        if (primary) {
            links.push(primary);
        }

        let secondary = _.get(prunedItem, 'secondaryLinks');
        delete prunedItem.secondaryLinks;
        if (secondary) {
            links = links.concat(secondary.map(function (e) {
                return e.url
            }));
        }

        let body = _.get(prunedItem, 'body', '');
        delete prunedItem.body;
        links = links.concat(getLinks(body).map(function (e) {
            return e.href
        }));

        let summary = _.get(prunedItem, 'summary', '');
        delete prunedItem.summary;
        links = links.concat(getLinks(summary).map(function (e) {
            return e.href
        }));

        //remove mail to links
        _.remove(links, function (e) {
            return _.startsWith(e, 'mailto:');
        });

        //prefix relative links
        links = links.map(function (e) {
            if (_.startsWith(e, '/')) {
                return 'https://www.gbif.org' + e;
            } else {
                return e;
            }
        });

        //remove gbif links and doi links
        _.remove(links, function (e) {
            return e.indexOf('gbif.org') === -1;
            // return _.startsWith(e, '/') || _.startsWith(e, '#') || e.indexOf('gbif.org') !== -1 || e.indexOf('doi.org/') !== -1 || e.indexOf('assets.contentful') !== -1;
        });

        //remove duplicates
        links = _.uniq(links);

        //prunedItem._links = links;

        allLinks = allLinks.concat(links.map(function (e) {
            return {
                link: e,
                prunedItem
            }
        }));
        //_.union(allLinks, links);
        return prunedItem;
    });

    // //test all links
    console.log('Start testing urls');
    async.mapLimit(allLinks, 100, function (item, cb) {
        isAvilable(item, cb);
    }, function (err, statusCodes) {
        if (err) {
            console.log(err);
        } else {
            fs.writeFile('./scripts/deadlinks.json', JSON.stringify(statusCodes, null, 2), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log('results written to file');
            });

            let suspicousLinks = _.filter(statusCodes, function (e) {
                return e.statusCode > 299;
            });

            fs.writeFile('./scripts/suspicousLinks.json', JSON.stringify(suspicousLinks, null, 2), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log('results written to file');
            });
        }
    });
    // console.log(allLinks);
}

let fetch = require('fetch');

function isAvilable(item, cb) {
    try {
        let options = {
            maxRedirects: 10,
            maxResponseLength: 10000,
            timeout: 30000
        };
        fetch.fetchUrl(item.link, options, function(error, meta, body) {
            if (error) {
                item.statusCode = _.get(error, 'status') || 500;
            } else {
                item.statusCode = _.get(meta, 'status') || 502;
            }
            cb(null, item);
        });
    } catch (err) {
        item.statusCode = 501;
        console.log(err);
        cb(null, item);
    }
}

search();

// a.forEach(function(e){
//     console.log(`* [ ] [${e.prunedItem.title}](https://gbif.org/${e.prunedItem.contentType}/${e.prunedItem.id}) links to [${e.link}](${e.link})`);
// });
