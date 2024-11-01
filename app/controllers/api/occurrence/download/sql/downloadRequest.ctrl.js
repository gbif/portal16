'use strict';
const express = require('express');
const router = express.Router();
const request = require('../../../../../helpers/request');
const apiConfig = require('../../../../../models/gbifdata/apiConfig');
const {highlight} = require('sql-highlight');
const {format} = require('sql-formatter');

module.exports = function(app) {
    app.use('/api/occurrence', router);
};

router.get('/formatSql', function(req, res) {
  try {
    let sql = req.query.sql;
    if (!sql) return res.sendStatus(500);
    validateSql(sql).then(function(response) {
      // is valid. Now format it
      // const sqlString = response.sql;// currently this creates broken sql so use original
      const sqlString = sql;
      const formattedSql = format(sqlString, {language: 'mysql'});

      return res.json({error: response.error, sql: formattedSql});
    }).catch(function(err) {
      console.log(err);
      return res.sendStatus(500);
    });
  } catch (err) {
    // invalid sql
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get('/downloadSql.html', function(req, res) {
  try {
    let sql = req.query.sql;
    if (!sql) return res.sendStatus(400);
    validateSql(sql).then(function(response) {
      if (response.error) return res.sendStatus(500);
      // const sqlString = response.sql;// currently this creates broken sql so use original
      const sqlString = sql;
      const formattedSql = format(sqlString, {language: 'mysql'});
      const highlighted = highlight(formattedSql, {
        html: true
      });
      return res.send(highlighted);
    }).catch(function(err) {
      console.log(err);
      return res.sendStatus(500);
    });
  } catch (err) {
    // invalid predicate
    console.log(err);
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
  return {sql: response.body.sql, error: null};
}