let express = require('express'),
    occurrenceKey = require('./occurrenceKey'),
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    helper = rootRequire('app/models/util/util'),
    request = rootRequire('app/helpers/request'),
    querystring = require('querystring'),
    apiConfig = require('../../../models/gbifdata/apiConfig'),
    utils = rootRequire('app/helpers/utils'),
    router = express.Router({caseSensitive: true}),
    prettifyXml = require('prettify-xml');


module.exports = function(app) {
    app.use('/', router);
};

router.get('/occurrence/:datasetKey/:occurrenceId', function(req, res, next) {
  let datasetKey = req.params.datasetKey;
  if (!utils.isGuid(datasetKey)) {
      next();
      return;
  }
  getByDatasetOccurrenceId(datasetKey, req.params.occurrenceId)
    .then(function(body) {
      res.redirect(302, res.locals.gb.locales.urlPrefix + '/occurrence/' + body.key);
    })
    .catch(next);
});

router.get('/occurrence/:key(\\d+).:ext?', render);
router.get('/occurrence/:key(\\d+)/cluster.:ext?', render);
router.get('/occurrence/:key(\\d+)/fragment.:ext?', async function(req, res, next) {
  let key = req.params.key;
  try {
    //if the occurrence exists, then redirect to the main page instead
    await occurrenceKey.getOccurrenceModel(key, res.__);
    res.redirect(303, res.locals.gb.locales.urlPrefix + `/occurrence/${key}`);
  } catch (err) {
    if (err.type == 'NOT_FOUND') {
      // else show the tombstone page
      try {
        let fragment = await getOccurrenceFragment({key});
        let isJson = false;
        let formattedFragment = fragment;
        if (typeof fragment === 'object') {
          isJson = true;
          formattedFragment = JSON.stringify(fragment, null, 2); 
        }
        if (!isJson) {
          try {
            // try to parse as xml
            const options = {indent: 2, newline: '\n'};
            formattedFragment = prettifyXml(fragment, options);
          } catch (jsonParseError) {
            isJson = false;
          }
        }
        renderTompstone(req, res, next, {fragment, key, isJson, formattedFragment});
      } catch (ignore) {
        next();
      }
    } else {
      next(err);
    }
  }
});

async function render(req, res, next) {
    let key = req.params.key;
    try {
      let occurrence = await occurrenceKey.getOccurrenceModel(key, res.__);
      renderPage(req, res, next, occurrence);
    } catch (err) {
      if (err.type == 'NOT_FOUND') {
        try {
          //if not found but the fragment exists, then redirect to a tombstone page
          await getOccurrenceFragment({key});
          console.log('redirect to fragment');
          res.redirect(303, res.locals.gb.locales.urlPrefix + `/occurrence/${key}/fragment`);
        } catch (ignore) {
          next();
        }
      } else {
        next(err);
      }
    }
}
router.get('/api/template/occurrence/:key(\\d+)', function(req, res, next) {
    let key = req.params.key;
    occurrenceKey.getOccurrenceModel(key, res.__).then(function(occurrence) {
        renderContent(req, res, next, occurrence);
    }).catch(function(err) {
        if (err.type == 'NOT_FOUND') {
            res.sendStatus(404);
        } else {
            res.sendStatus(500);
        }
    });
});

router.get('/occurrence/:key(\\d+)/verbatim', function(req, res, next) {
    let key = req.params.key;
    res.redirect(302, res.locals.gb.locales.urlPrefix + '/occurrence/' + key);
});

router.get('/occurrence/first', function(req, res, next) {
    occurrenceSearchFirst(req.query).then(function(resp) {
        if (resp.count == 1) {
            res.redirect(302, res.locals.gb.locales.urlPrefix + '/occurrence/' + resp.results[0].key);
        } else {
            res.redirect(302, res.locals.gb.locales.urlPrefix + '/occurrence/search?' + querystring.stringify(req.query));
        }
    }, function(err) {
        next(err);
    });
});

function renderPage(req, res, next, occurrence) {
    try {
        if (req.params.ext == 'debug') {
            res.json(occurrence);
        } else {
            let angularInitData = occurrenceKey.getAngularInitData(occurrence);
            let contentItem = {
                occurrence: occurrence,
                occurrenceCoreTerms: occurrenceKey.occurrenceCoreTerms,
                angularInitData: angularInitData,
                occurrenceRemarks: occurrenceKey.occurrenceRemarks,
                _meta: {
                    title: 'Occurrence Detail ' + req.params.key,
                    hasTools: true,
                    imageCacheUrl: imageCacheUrl,
                    onlyNoFollow: true
                }
            };
            helper.renderPage(req, res, next, contentItem, 'pages/occurrence/key/occurrenceKey');
        }
    } catch (e) {
        next(e);
    }
}

function renderContent(req, res, next, occurrence) {
    try {
        let angularInitData = occurrenceKey.getAngularInitData(occurrence);
        let contentItem = {
            occurrence: occurrence,
            occurrenceCoreTerms: occurrenceKey.occurrenceCoreTerms,
            angularInitData: angularInitData,
            occurrenceRemarks: occurrenceKey.occurrenceRemarks,
            _meta: {
                title: 'Occurrence Detail ' + req.params.key,
                hasTools: true,
                imageCacheUrl: imageCacheUrl
            }
        };
        helper.renderPage(req, res, next, contentItem, 'pages/occurrence/key/occurrenceKey.template.nunjucks');
    } catch (e) {
        res.sendStatus(500);
    }
}

function renderTompstone(req, res, next, occurrence) {
  try {
    let contentItem = {
      occurrence: occurrence,
      _meta: {
        title: 'Occurrence not found',
        hasTools: true,
        imageCacheUrl: imageCacheUrl,
        onlyNoFollow: true
      }
    };
    helper.renderPage(req, res, next, contentItem, 'pages/occurrence/key/tombstone/tombstone');
  } catch (e) {
    next(e);
  }
}

async function occurrenceSearchFirst(query) {
    let baseRequest = {
        url: apiConfig.occurrenceSearch.url + '?' + querystring.stringify(query),
        method: 'GET',
        json: true,
        fullResponse: true
    };
    let response = await request(baseRequest);
    if (response.statusCode != 200) {
        throw response;
    }
    return response.body;
}

async function getByDatasetOccurrenceId(datasetKey, occurrenceId) {
  let baseRequest = {
      url: apiConfig.occurrence.url + datasetKey + '/' + occurrenceId,
      method: 'GET',
      json: true,
      fullResponse: true
  };
  let response = await request(baseRequest);
  if (response.statusCode != 200) {
      throw response;
  }
  return response.body;
}

async function getOccurrenceFragment({key}) {
  let baseRequest = {
      url: apiConfig.occurrence.url + `${key}/fragment`,
      method: 'GET',
      json: true,
      fullResponse: true
  };
  let response = await request(baseRequest);
  if (response.statusCode != 200) {
      throw response;
  }
  return response.body;
}