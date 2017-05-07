"use strict";
var express = require('express'),
    router = express.Router(),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    querystring = require('querystring'),
    request = require('requestretry');


module.exports = function (app) {
    app.use('/api', router);
};

router.get('/species/:key/images', function (req, res) {
    let taxonKey = req.params.key,
        images = query({
            media_type: 'StillImage',
            taxonKey: taxonKey,
            limit: 10
        });

    images
        .then(function (response) {
            let imgList = getImages(response.results);
            res.json(imgList);
        })
        .catch(function () {
            res.status(500);
            res.send('SERVER FAILURE');
        });
});

router.get('/species/:key/image', function (req, res) {
    let taxonKey = req.params.key,
        images = query({
            media_type: 'StillImage',
            taxonKey: taxonKey,
            limit: 1
        });

    images
        .then(function (response) {
            let imgList = getImages(response.results);
            if (imgList.length > 0) {
                res.send(imgList[0]);
            } else {
                res.status(204);
                res.send();
            }
        })
        .catch(function () {
            res.status(500);
            res.send('SERVER FAILURE');
        });
});

async function query(query, options) {
    options = options || {};
    query = query || {};

    let baseRequest = {
        url: apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query),
        timeout: options.timeout || 30000,
        method: 'GET',
        json: true
    };

    let items = await request(baseRequest);
    if (items.statusCode > 299) {
        throw items;
    }
    return items.body;
}

function getImages(results) {
    let images = [];
    results.forEach(function (e) {
        //select first image
        for (var i = 0; i < e.media.length; i++) {
            if (e.media[i].type == 'StillImage') {
                images.push(e.media[i].identifier);
                return;
            }
        }
    });
    return images;
}

