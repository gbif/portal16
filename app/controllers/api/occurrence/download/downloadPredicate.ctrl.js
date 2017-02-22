"use strict";
var express = require('express'),
    helper = rootRequire('app/models/util/util'),
    queryResolver = rootRequire('app/controllers/occurrence/download/queryResolver'),
    downloadHelper = rootRequire('app/controllers/occurrence/download/downloadKeyHelper'),
    router = express.Router();

module.exports = function (app) {
    app.use('/api', router);
};

router.post('/downloadPredicate', function (req, res, next) {
    var predicate = req.body;
    parsePredicate(predicate, res, function(err, decoratedPredicate){
        helper.renderPage(req, res, next, {decoratedPredicate: decoratedPredicate}, 'pages/occurrence/download/key/predicateOnly');
    });
});

function parsePredicate(predicate, res, cb) {
    let promiseList = [];
    if (!predicate) {
        download.noFilters = true;
        renderPage(req, res, next, download);
    } else {
        downloadHelper.addChildKeys(predicate);
        downloadHelper.addSyntheticTypes(predicate);
        downloadHelper.setDepths(predicate);
        //download.isSimple = downloadHelper.getSimpleQuery(predicate);
        downloadHelper.addpredicateResolveTasks(predicate, queryResolver, promiseList, res.__mf);
        downloadHelper.flattenSameType(predicate);
        Promise.all(promiseList).then(function(){
            cb(null, predicate);
        });
    }
}