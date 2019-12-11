'use strict';
let express = require('express'),
    router = express.Router(),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    querystring = require('querystring'),
    request = rootRequire('app/helpers/request'),
    log = require('../../../../../config/log');


module.exports = function(app) {
    app.use('/api', router);
};

router.get('/species/:key/images', function(req, res) {
    let taxonKey = req.params.key,
        images = query({
            media_type: 'StillImage',
            taxonKey: taxonKey,
            limit: 10
        });

    images
        .then(function(response) {
            let imgList = getImages(response.results).filter((img) => {
                return img.identifier.indexOf('zenodo.org') === -1;
                });
            res.json(imgList);
        })
        .catch(function(err) {
            log.error(err);
            res.status(500);
            res.send('SERVER FAILURE');
        });
});

router.get('/species/:key/occimage', function(req, res) {
    let taxonKey = req.params.key,
        images = query({
            media_type: 'StillImage',
            taxonKey: taxonKey,
            limit: 1
        });

    images
        .then(function(response) {
            let imgList = getImages(response.results);
            if (imgList.length > 0) {
                // select first image
                res.send(imgList[0]);
            } else {
                res.status(204);
                res.send();
            }
        })
        .catch(function(err) {
            log.error(err);
            res.status(500);
            res.send('SERVER FAILURE');
        });
});

router.get('/species/:key/image', function(req, res) {
    let
        images = getSpeciesImages(req.params.key);

    images
        .then(function(imgList) {
            const filteredImages = imgList.filter((img) => {
                return img.identifier.indexOf('zenodo.org') === -1;
                });
            if (filteredImages.length > 0) {
                res.send(filteredImages[0]);
            } else {
                res.status(404);
                res.send();
            }
        })
        .catch(function(err) {
            log.error(err);
            let status = err.statusCode || 500;
            res.sendStatus(status);
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

async function getSpeciesImages(taxonKey) {
    let baseRequest = {
        url: apiConfig.taxon.url + taxonKey + '/media',
        timeout: 30000,
        method: 'GET',
        json: true
    };

    let items = await request(baseRequest);
    if (items.statusCode > 299) {
        throw items;
    }
    let images = [];

        // select first image
        for (let i = 0; i < items.body.results.length; i++) {
            if (items.body.results[i].type == 'StillImage') {
                images.push(items.body.results[i]);
            }
        }

    return images;
}

function getImages(results) {
    let images = [];
    results.forEach(function(e) {
        for (let i = 0; i < e.media.length; i++) {
            if (e.media[i].type == 'StillImage') {
                images.push(e.media[i].identifier);
            }
        }
    });
    return images;
}

