'use strict';
let express = require('express'),
    router = express.Router(),
    format = require('../../helpers/format'),
    cmsUrlEncode = require('../../helpers/cmsUrlEncode'),
    config = require('../../../config/config'),
    cmsApi = require('../../models/cmsData_deprecated/apiConfig'),
    cmsData = require('../../models/cmsData_deprecated/cmsData'),
    dataApi = require('../../models/gbifdata/apiConfig'),
    md = require('markdown-it')({html: true, linkify: true, typographer: true});

md.use(require('markdown-it-video'), {
    youtube: {width: 640, height: 390},
    vimeo: {width: 500, height: 281},
    vine: {width: 600, height: 600, embed: 'simple'},
    prezi: {width: 550, height: 400}
});

let cmsContent = function (app) {
    app.use('/', router);
};

cmsContent.prototype.record = {};

router.get([
        '/news/:requestedPath(*)',
        '/data-use/:requestedPath(*)',
        '/event/:requestedPath(*)',
        '/page/:requestedPath(*)',
        '/programme/:requestedPath(*)',
        '/project/:requestedPath(*)',
        '/participant/:requestedPath(*)',
        '/resource/:requestedPath(*)'
    ],
    function (req, res, next) {
        let originalUrl,
            originalUrlForLookup,
            requestedPath,
            jsonOutput = false;

        // If there is '.debug' then later output data as JSON
        if (req.params.requestedPath.search(/\.debug/) != -1) {
            requestedPath = req.params.requestedPath.replace('.debug', '');
            originalUrl = req.originalUrl.replace('.debug', '');
            jsonOutput = true;
        }
        else {
            // requestedPath is the captured alias in this route
            requestedPath = req.params.requestedPath;
            // originalURL is used as the second attempt for checking existing alias
            originalUrl = req.originalUrl;
        }

        if (originalUrl.substring(0, 1) == '/') {
            originalUrlForLookup = originalUrl.slice(1);
        }

        // Many old URLs start with the content type prefix so we need to handle the redirection here if
        // it doesn't captured by the generic urlHandling(/app/urlHandling).
        // For an old URL, it's usually captured with originalUrl and redirected to an URL with
        // prefix of the content type in the new site. So rendering happens when the targetUrl matches
        // requestedUrl.
        cmsData.cmsEndpointAccess(cmsApi.urlLookup.url + requestedPath)
            .then(function (data) {
                if (typeof data.data[0] == 'object' && typeof data.data[0].targetUrl == 'string') {
                    if (data.data[0].targetUrl === requestedPath) {
                        let contentType = data.data[0].type;
                        let nid = data.data[0].id;
                        contentType = (contentType == 'data_use') ? 'dataUse' : contentType;
                        contentType = (contentType == 'gbif_participant') ? 'participant' : contentType;
                        return cmsData.cmsEndpointAccess(cmsApi[contentType].url + nid);
                    }
                    else {
                        return cmsData.cmsEndpointAccess(cmsApi.urlLookup.url + originalUrlForLookup);
                    }
                }
                else {
                    return cmsData.cmsEndpointAccess(cmsApi.urlLookup.url + originalUrlForLookup);
                }
            })
            .then(function (data) {
                // Render content if the result is not from URL Lookup.
                if (typeof data.data[0] == 'object' && data.data[0].hasOwnProperty('created') && data.data[0].hasOwnProperty('title')) {

                    // attach relatedDatasets via associated project_id.
                    if (data.data[0].type == 'project' && data.data[0].projectId) {
                        return cmsData.cmsEndpointAccess(dataApi.datasetSearch.url + '?project_id=' + data.data[0].projectId).then(function (datasets) {
                            data.data[0].relatedDatasets = datasets.results;
                            return cmsContent.renderPage(data, jsonOutput, res, req, next);
                        });
                    }
                    return cmsContent.renderPage(data, jsonOutput, res, req, next);
                }
                // Redirect if the result is from URL Lookup.
                else if (typeof data.data[0] == 'object' && typeof data.data[0].targetUrl == 'string') {
                    if (data.data[0].targetUrl == originalUrlForLookup) {
                        // type-URL conversion
                        let contentTypeUrlPrefix = (data.data[0].type == 'gbif_participant') ? data.data[0].type.replace('gbif_', '') : data.data[0].type.replace('_', '-');
                        let redirectedUrl;
                        if (contentTypeUrlPrefix == 'external') {
                            redirectedUrl = data.data[0].targetUrl;
                        }
                        else {
                            redirectedUrl = '/' + contentTypeUrlPrefix + '/' + data.data[0].targetUrl;
                        }
                        res.redirect(307, redirectedUrl);
                    }
                }
                else {
                    next();
                }
            })
            .catch(function (err) {
                next(err);
            });

    }
);

cmsContent.renderPage = (body, jsonOutput, res, req, next) => {
    try {

        // Expand/modify data before rendering
        switch (body.data[0].type) {
            case 'generic':
                // markdown/html inline URL extracting and prefixing
                if (body.data[0].body && body.data[0].body.value) {
                    body.data[0].body.value = cmsUrlEncode.extractAndEncodeUriMarkdown(body.data[0].body.value);
                    body.data[0].body.markdown = md.render(body.data[0].body.value);
                }
                else {
                    body.data[0].body = {
                        'value': 'Pending content.',
                        'markdown': 'Pending content.'
                    };
                }
                break;

            case 'resource':
                // Preprocess file size string (for resource)
                if (typeof body.data[0].file !== 'undefined' && body.data[0].file.length > 0) {
                    body.data[0].file[0].filesize = format.formatBytes(body.data[0].file[0].filesize, 1);
                }

                // use add description field
                if (body.data[0].hasOwnProperty('description')) {
                    body.data[0].description = cmsUrlEncode.extractAndEncodeUriHtml(body.data[0].description);
                }

                // resource image field URL
                if (body.data[0].hasOwnProperty('images') && body.data[0].images !== null && body.data[0].images.length > 0) {
                    body.data[0].images.forEach(function(image){
                        image.urlForImageCache = cmsUrlEncode.appendImgCachePrefix(image.urlForImageCache);
                    });
                }

                break;

            default:
                if (body.data[0].hasOwnProperty('body')) {
                    body.data[0].body = cmsUrlEncode.extractAndEncodeUriHtml(body.data[0].body);
                }
                break;
        }

        let proseContent = {
            data: body.data[0],
            images: body.data[0].images,
            self: body.self,
            _meta: {
                title: body.data[0].title,
                hasTools: true,
                originalUrl: req.originalUrl,
                domain: config.domain,
                imageCacheUrl: cmsUrlEncode.imageCacheUrl
            }
        };

        if (jsonOutput == true) {
            res.json(proseContent);
        } else {
            let contentType = body.data[0].type;
            contentType = (contentType == 'gbif_participant') ? 'participant' : contentType;
            res.render('pages/about/' + contentType + '/' + contentType + '.nunjucks', proseContent);
        }
    } catch (e) {
        next(e);
    }
};

module.exports = cmsContent;