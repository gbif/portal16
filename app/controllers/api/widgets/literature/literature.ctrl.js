'use strict';
let express = require('express'),
  router = express.Router(),
  resourceSearch = require('../../resource/search/resourceSearch'),
  querystring = require('querystring'),
  log = require('../../../../../config/log');

module.exports = function (app) {
  app.use('/api', router);
};

router.get('/widgets/literature/button', async function (req, res) {
  const searchQuery = req.query;
  searchQuery.contentType = 'literature';
  const query = querystring.stringify(searchQuery);
  resourceSearch.search(searchQuery, req.__)
    .then(function (result) {
      // res.json(result);
      renderPage(req, res, {
        count: result.count,
        query: query
      }, 'widgets/literature/button');
    })
    .catch(function (err) {
      log.error('Unable to serve literature widget button');
      log.error(err);

      res.status(500);
      res.send('Unable to get literature count');
    });
});

router.get('/widgets/literature/latest', async function (req, res) {
  let limit = 25;
  const searchQuery = req.query;
  searchQuery.contentType = 'literature';
  searchQuery.limit = limit;
  searchQuery.offset = 0;
  const query = querystring.stringify(searchQuery);
  resourceSearch.search(searchQuery, req.__)
    .then(function (result) {
      // res.json(result);
      renderPage(req, res, {
        data: result,
        query: query
      }, 'widgets/literature/latest');
    })
    .catch(function (err) {
      log.error('Unable to serve literature widget feed');
      log.error(err);

      res.status(500);
      res.send('Unable to get literature feed');
    });
});

function renderPage(req, res, data, template) {
  try {
    res.render(template, data);
  } catch (e) {
    res.status(500).send('Unable to get literature count');
  }
}
