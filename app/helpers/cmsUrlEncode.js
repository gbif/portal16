'use strict';

let env = process.env.NODE_ENV || 'local',
    imageCacheUrl = require('../models/gbifdata/apiConfig').image.url;

function appendImgCachePrefix(url) {
    return imageCacheUrl + url;
}

function extractAndEncodeUriMarkdown(text) {
    let regex = /\]\(http\:\/\/([a-z]+\.)?gbif(-dev|-uat)?\.org\/sites\/default\/files\/documents\/.*\.(png|PNG|jpg|JPG|jpeg|JPEG|pdf|PDF)/g;

    return text.replace(regex, function (match) {
        return '](' + appendImgCachePrefix(encodeURIComponent(match.substring(2)));
    });
}

// @todo merge in one function with extractAndEncodeUriMarkdown()
function extractAndEncodeUriHtml(text) {
    let regex = /src\=\"http\:\/\/([a-z]+\.)?gbif(-dev|-uat)?\.org\/sites\/default\/files\/.*\.(png|PNG|jpg|JPG|jpeg|JPEG|pdf|PDF)/g;

    return text.replace(regex, function (match) {
        return 'src="' + appendImgCachePrefix(encodeURIComponent(match.substring(5)));
    });
}

// @todo to be removed if it's not used.
function processEncodedUrl(url) {
    let count = 0;
    while (count < 3 && url != decodeURIComponent(url)) {
        url = decodeURIComponent(url);
        count++;
    }
    let final = encodeURIComponent(url);
    return appendImgCachePrefix(final)
}

module.exports = {
    extractAndEncodeUriMarkdown: extractAndEncodeUriMarkdown,
    extractAndEncodeUriHtml: extractAndEncodeUriHtml,
    imageCacheUrl: imageCacheUrl
};