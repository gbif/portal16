'use strict';

let express = require('express'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

router.get('/suggest-dataset', function(req, res, next) {
    let context = {
        _meta: {
            title: 'Suggest dataset'
        }
    };
    try {
        res.render('pages/tools/suggestDataset/suggestDataset', context);
    } catch (err) {
        next(err);
    }
});
