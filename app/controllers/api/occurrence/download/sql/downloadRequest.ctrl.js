'use strict';
const express = require('express');
const router = express.Router();
const request = require('../../../../../helpers/request');
const apiConfig = require('../../../../../models/gbifdata/apiConfig');
const { highlight } = require('sql-highlight');

module.exports = function (app) {
  app.use('/api/occurrence', router);
};

router.get('/formatSql', function (req, res) {
  try {
    let sql = req.query.sql;
    if (!sql) return res.sendStatus(500);
    validateSql(sql).then(function (response) {
      const sqlString = response.sql;
      return res.json({error: response.error, sql: sqlString});
    }).catch(function (err) {
      console.error(err);
      return res.sendStatus(500);
    });
  } catch (err) {
    // invalid sql
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get('/downloadSql.html', function (req, res) {
  try {
    let sql = req.query.sql;
    if (!sql) return res.sendStatus(400);
    validateSql(sql).then(function (response) {
      if (response.error) return res.sendStatus(500);
      const formattedSql = response.sql;
      const highlighted = highlight(formattedSql, {
        html: true
      });
      return res.send(highlighted);
    }).catch(function (err) {
      return res.sendStatus(500);
    });
  } catch (err) {
    // invalid predicate
    return res.sendStatus(500);
  }
});

async function validateSql(sql) {
  const query = {
    'format': 'SQL_TSV_ZIP',
    'sql': sql
  };
  let options = {
    url: apiConfig.occurrenceDownloadRequestValidate.url,
    timeout: 30000,
    method: 'POST',
    json: query
  };
  let response = await request(options);
  if (response.statusCode === 400) {
    return {
      error: response.body.reason
    };
  }
  if (response.statusCode > 299) {
    return {
      error: 'Unable to parse SQL'
    };
  }
  return { sql: response.body.sql, error: null };
}