// copied from https://github.com/sindresorhus/get-urls/ and changed to return array instead
'use strict';
const URL = require('url');
const urlRegex = require('url-regex');
const normalizeUrl = require('normalize-url');

function getUrlsFromQueryParams(url) {
    const ret = [];

    // TODO: Use `(new URL(url)).searchParams` when targeting Node.js 8
    const qs = URL.parse(url, true).query;

    for (const key of Object.keys(qs)) {
        const value = qs[key];
        if (urlRegex({exact: true}).test(value)) {
            ret.push(value);
        }
    }

    return ret;
}

function getUrls(text, options) {
    options = options || {};

    const ret = [];

    const add = (url) => {
        ret.push(normalizeUrl(url.trim().replace(/\.+$/, ''), options));
    };

    const urls = text.match(urlRegex()) || [];
    for (const url of urls) {
        add(url);

        if (options.extractFromQueryString) {
            for (const qsUrl of getUrlsFromQueryParams(url)) {
                add(qsUrl);
            }
        }
    }

    return ret;
}

function hasDuplicateLinks(text, options, threshold) {
    let links = getUrls(text, options);
    let count = {};
    for (let i = 0; i < links.length; i++) {
        let link = links[i];
        count[link] = count[link] ? count[link] + + 1 : 1;
        if (count[link] >= threshold) {
            return true;
        }
    }
    return false;
}

module.exports = {
    hasDuplicateLinks: hasDuplicateLinks
};
