"use strict";

var express = require('express'),
    Download = require('../../../models/gbifdata/gbifdata').Download,
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    queryResolver = require('./queryResolver'),
    router = express.Router(),
    downloadHelper = require('./downloadKeyHelper');

module.exports = function (app) {
    app.use('/occurrence', router);
};

router.get('/download/:key\.:ext?', function (req, res, next) {
    var key = req.params.key,
        offset = req.query.offset || 0,
        limit = 500;

    var datasetsUrl = apiConfig.occurrenceDownload.url + key + '/datasets?offset=' + offset + '&limit=' + limit;
    Promise.all([downloadHelper.getResource(datasetsUrl), Download.get(key)]).then(function(values){
        let datasets = values[0],
            download = values[1];
        download.datasets = datasets;

        let promiseList = [downloadHelper.isFileAvailable(download)];
        try{
            download.predicateString = JSON.stringify(download.record.request.predicate, undefined, 2);

            if (!download.record.request.predicate) {
                download.noFilters = true;
                renderPage(req, res, next, download);
            } else {
                downloadHelper.addChildKeys(download.record.request.predicate);
                downloadHelper.addSyntheticTypes(download.record.request.predicate);
                downloadHelper.setDepths(download.record.request.predicate);
                download.isSimple = downloadHelper.getSimpleQuery(download.record.request.predicate);
                downloadHelper.addpredicateResolveTasks(download.record.request.predicate, queryResolver, promiseList, res.__mf);
                downloadHelper.flattenSameType(download.record.request.predicate);
                Promise.all(promiseList).then(function(){
                    renderPage(req, res, next, download);
                });
            }
        } catch(err){
            next(err);
        }

    }, function(err){
        console.log(err);
    });
});

function renderPage(req, res, next, download) {
    try {
        if (req.params.ext == 'debug') {
            res.json(download);
        } else {
            res.render('pages/occurrence/download/key/occurrenceDownloadKey', {
                download: download,
                title: 'Ocurrences',
                _meta: {
                    title: res.__('stdTerms.download')
                }
            });
        }
    } catch (e) {
        next(e);
    }
}