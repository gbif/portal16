var express = require('express'),
    _ = require('lodash'),
    utils = rootRequire('app/helpers/utils'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/dataset2/:key\.:ext?', function render(req, res) {
    var datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
        return;
    }
    res.render('pages/dataset/key2/datasetKey', {
        key: req.params.key,
        _meta: {
            title: 'Dataset',
            hasTools: false,
            hideFooter: true
        }
    });
});