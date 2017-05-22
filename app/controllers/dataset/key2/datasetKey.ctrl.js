var express = require('express'),
    _ = require('lodash'),
    utils = rootRequire('app/helpers/utils'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/dataset2/:key', render);
router.get('/dataset2/:key/taxonomy', render);
router.get('/dataset2/:key/project', render);
router.get('/dataset2/:key/stats', render);

function render(req, res, next) {
    let datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
        return;
    }
    res.render('pages/dataset/key2/datasetKey', {
        key: req.params.key,
        _meta: {
            title: 'Dataset'
        }
    });
};


