var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/tools/suggest-dataset', function (req, res) {
    res.render('pages/tools/suggestDataset/suggestDataset', {
        _meta: {
            title: 'Suggest dataset'
        }
    });
});

