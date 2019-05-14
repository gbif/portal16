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
        if (download.predicateString && download.predicateString.length > 10000) {
            download._hugeQuery = true;
            return Promise.all(promiseList).then(function(completedPromises) {
                download._citationCount = completedPromises[0].count;
                renderPage(req, res, next, download, template);
            });
        } else if (!download.record.request.predicate) {
            download.noFilters = true;
            return Promise.all(promiseList).then(function(completedPromises) {
                download._citationCount = completedPromises[0].count;
                renderPage(req, res, next, download, template);
            });
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
            });
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
                    // schema: getMetaSchema(download) // discontinued due to issues in https://github.com/gbif/portal-feedback/issues/1669#issuecomment-488245627
                }
            });
        }
    } catch (e) {
        next(e);
    }
}

// discontinued due to issues in https://github.com/gbif/portal-feedback/issues/1669#issuecomment-488245627
// function getMetaSchema(download, datasets) {
//     let isBasedOn = _.range(0, 24000).map(function(e) {
//         return {
//             '@type': 'DataSet',
//             '@id': 'https://doi.org/10.15468/pdlhty' + e
//         };
//     });

//     let schema = {
//         '@context': 'http://schema.org',
//         '@type': 'DataSet',
//         '@id': 'https://doi.org/10.15468/dl.2ohxaa',
//         'distribution': {
//             '@type': 'DataDownload',
//             'contentUrl': 'http://api.gbif.org/v1/occurrence/download/request/0029115-180131172636756.zip',
//             'contentSize': '450889',
//             'encodingFormat': 'text/csv',
//             'expires': '2020-03-13'
//         },
//         'isBasedOn': isBasedOn,
//         'identifier': [
//           {
//             '@type': 'PropertyValue',
//             'propertyID': 'doi',
//             'value': 'https://doi.org/10.15468/dl.2ohxaa'
//           },
//           {
//             '@type': 'PropertyValue',
//             'propertyID': 'UUID',
//             'value': '0029115-180131172636756'
//           }
//         ],
//         'url': 'https://www.gbif.org/occurrence/download/0029115-180131172636756',
//         'name': 'GBIF Occurrence Download',
//         'description': 'A dataset containing 8285 species occurrences available in GBIF matching the query: TaxonKey: Macrolepiota procera (Scop.) Singer, 1948. The dataset includes 8285 records from 146 constituent datasets: ... Data from some individual datasets included in this download may be licensed under less restrictive terms.',
//         'license': 'http://creativecommons.org/licenses/by/4.0/legalcode',
//         'inLanguage': 'eng',
//         'datePublished': '2018-04-05',
//         'provider': {
//           '@type': 'Organization',
//             'name': 'GBIF',
//             'url': 'https://www.gbif.org',
//             'logo': 'https://www.gbif.org/img/logo/GBIF-2015.png',
//             'email': 'info@gbif.org'
//         }
//       };
//     return schema;
// }
