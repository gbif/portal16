'use strict';

let express = require('express'),
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    request = rootRequire('app/helpers/request'),
    resourceSearch = rootRequire('app/controllers/api/resource/search/resourceSearch'),
    log = require('../../../../config/log'),
    router = express.Router();

module.exports = function(app) {
    app.use('/derivedDataset', router);
};


router.get('/:prefix/:suffix', function(req, res, next) {
    renderDerived(req, res, next, 'pages/derivedDataset/key/derivedDatasetKey');
});

async function renderDerived(req, res, next, template) {
    let doi = `${req.params.prefix}/${req.params.suffix}`,
        offset = req.query.offset || 0,
        limit = 500;

    let derivedDatasetUrl = apiConfig.derivedDataset.url + doi;
    let derivedDatasetCitationUrl = apiConfig.derivedDataset.url + doi + '/citation';
    let datasetsUrl = apiConfig.derivedDataset.url + doi + '/datasets?offset=' + offset + '&limit=' + limit;

    let citations;
    try {
      citations = await resourceSearch.search({contentType: 'literature', gbifDerivedDatasetDoi: doi, limit: 0}, req.__);
    } catch (err) {
      // ignore failure to get citations
    }

    Promise.all([
      getResource(derivedDatasetUrl),
      getResource(datasetsUrl),
      getResource(derivedDatasetCitationUrl)
    ]).then(function(values) {
        let derivedDataset = values[0],
            datasets = values[1],
            citation = values[2];
        derivedDataset.datasets = datasets;
        derivedDataset.citation = citation;
        if (citations) {
          derivedDataset._citationCount = citations.count;
        }

        renderPage(req, res, next, derivedDataset, template);
    }).catch(function(err) {
        if (err.type == 'NOT_FOUND') {
            next();
        } else {
            log.error(err);
            next(err);
        }
    });
}

function renderPage(req, res, next, derivedDataset, template) {
    try {
        if (req.params.ext == 'debug') {
            res.json(derivedDataset);
        } else {
            res.render(template, {
                derivedDataset: derivedDataset,
                _meta: {
                    title: res.__('derivedDatasetKey.derivedDataset')
                }
            });
        }
    } catch (e) {
        next(e);
    }
}

async function getResource(url) {
  let options = {
      url: url,
      retries: 3,
      timeout: 30000,
      json: true
  };
  let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

