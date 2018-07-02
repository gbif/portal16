'use strict';

let express = require('express'),
    utils = rootRequire('app/helpers/utils'),
    helper = rootRequire('app/models/util/util'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    request = require('requestretry'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};

router.get('/dataset/:key', render);
// router.get('/dataset/:key/taxonomy', render);
router.get('/dataset/:key/activity', render);
router.get('/dataset/:key/project', render);
router.get('/dataset/:key/metrics', render);
router.get('/dataset/:key/constituents', render);
router.get('/dataset/:key/event/:eventKey', render);

function render(req, res, next) {
    let datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
        return;
    }
    getDataset(apiConfig.dataset.url, datasetKey)
        .then(function(dataset) {
            let contentItem = {
                // key: req.params.key,
                dataset: dataset,
                _meta: {
                    title: dataset.title,
                    description: dataset.description
                }
            };
            helper.renderPage(req, res, next, contentItem, 'pages/dataset/key/seo');
        })
        .catch(function(err) {
            if (err.statusCode == 404) {
                next();
            } else {
                next(err);
            }
        });
}

async function getDataset(url, key) {
    let options = {
        url: url + key,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}


