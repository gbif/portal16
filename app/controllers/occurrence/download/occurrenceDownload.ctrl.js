'use strict';

let express = require('express'),
    Download = require('../../../models/gbifdata/gbifdata').Download,
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    resourceSearch = rootRequire('app/controllers/api/resource/search/resourceSearch'),
    queryResolver = require('./queryResolver'),
    log = require('../../../../config/log'),
    router = express.Router(),
    _ = require('lodash'),
    downloadHelper = require('./downloadKeyHelper');

module.exports = function(app) {
    app.use('/occurrence', router);
};


router.get('/download/:key/card.:ext?', function(req, res, next) {
    renderDownload(req, res, next, 'pages/occurrence/download/key/downloadCardContent');
});

router.get('/download/:key.:ext?', function(req, res, next) {
    renderDownload(req, res, next, 'pages/occurrence/download/key/occurrenceDownloadKey');
});

function renderDownload(req, res, next, template) {
    let key = req.params.key,
        offset = req.query.offset || 0,
        limit = 500;

    let datasetsUrl = apiConfig.occurrenceDownload.url + key + '/datasets?offset=' + offset + '&limit=' + limit;
    Promise.all([downloadHelper.getResource(datasetsUrl), Download.get(key)]).then(function(values) {
        let datasets = values[0],
            download = values[1];
        download.datasets = datasets;
        download.isFileAvailable = _.get(download, 'record.downloadLink') && _.get(download, 'record.status') !== 'FILE_ERASED';

        let promiseList = [resourceSearch.search({contentType: 'literature', gbifDownloadKey: key, limit: 0}, req.__)];
           
        download.predicateString = JSON.stringify(download.record.request.predicate, undefined, 2);

            // if unreasonably long request, then returtn a dumbed down version to display to the user
            if (download.predicateString && download.predicateString.length > 7000) {
                download._hugeQuery = true;
                renderPage(req, res, next, download, template);
                return;
            }

            if (!download.record.request.predicate) {
                download.noFilters = true;
               return Promise.all(promiseList).then(function(completedPromises) {
                    download._citationCount = completedPromises[0].count;
                    renderPage(req, res, next, download, template);
                })
            } else {
                downloadHelper.addChildKeys(download.record.request.predicate);
                downloadHelper.addSyntheticTypes(download.record.request.predicate);
                downloadHelper.setDepths(download.record.request.predicate);
                download.isSimple = downloadHelper.getSimpleQuery(download.record.request.predicate);
                downloadHelper.flattenSameType(download.record.request.predicate);
                downloadHelper.addpredicateResolveTasks(download.record.request.predicate, queryResolver, promiseList, res.__mf);
            return Promise.all(promiseList).then(function(completedPromises) {
                    download._citationCount = completedPromises[0].count;
                    renderPage(req, res, next, download, template);
                })
            }
        
    }).catch(function(err) {
        if (err.type == 'NOT_FOUND') {
            next();
        } else {
            log.error(err);
            next(err);                    
        }
    });
}

function renderPage(req, res, next, download, template) {
    try {
        if (req.params.ext == 'debug') {
            res.json(download);
        } else {
            if (download.record.status == 'PREPARING' || download.record.status == 'RUNNING') {
                res.setHeader('Cache-Control', 'no-cache');
            } else {
                res.setHeader('Cache-Control', 'public, max-age=' + 600);// 10 minutes
            }
            res.render(template, {
                download: download,
                title: 'Ocurrences',
                _meta: {
                    title: res.__('downloadKey.download')
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
