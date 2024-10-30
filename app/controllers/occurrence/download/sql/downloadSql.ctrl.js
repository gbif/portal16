'use strict';

let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    request = require('../../../../helpers/request'),
    {highlight} = require('sql-highlight'),
    apiConfig = require('../../../../models/gbifdata/apiConfig');

module.exports = function(app) {
    app.use('/occurrence', router);
};

router.get('/download/sql', function(req, res, next) {
  let source = _.get(req, 'query.source');
  const referrer = req.get('Referrer');
  if (referrer) {
    const referrerUrl = new URL(referrer);
    // if source name undefined, then overwrite with referrer hostname
    source = source || referrerUrl.hostname;
  }
  
  if (source) {
    res.cookie('downloadSource', source,
      {
        maxAge: 600000, // 10 minute
        secure: false,
        httpOnly: false
      }
    );
  } else {
    res.clearCookie('downloadSource');
  }
  if (req.query.sql && req.query.sql !== '') {
    sqlRequestHandler({req, res, next, sql: req.query.sql});
  } else {
    return res.render('pages/occurrence/download/custom/custom.nunjucks', {});
  }
});

async function sqlRequestHandler({req, res, next, sql}) {
  try {
    let validationResponse = await validateSql(sql);
    if (validationResponse.error) {
      return res.render('pages/occurrence/download/sql/custom.nunjucks', {
        invalidSql: true,
        parsingError: validationResponse.error,
        sql: sql
      });
    }
    const highlighted = highlight(validationResponse.sql, {
      html: true
    });
    return res.render('pages/occurrence/download/sql/custom.nunjucks', {
      sql: validationResponse.sql,
      invalidSql: false,
      highlighted: highlighted
    });
  } catch (err) {
    return res.render('pages/occurrence/download/sql/custom.nunjucks', {
      invalidSql: true,
      predicate: sql
    });
  }
}

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
      throw response;
  }
  return {sql: response.body.sql};
}

/*
why do i get a 201 created back when posting. nothing is created. it is just a validation. I would have expected a 200 back.

i get a 404 back if the json is not accepted. I would have expected a 400 or 422 back.

the tech doc provides an invalid example with a nonsense predicate. It would be better with an example that works.

Even witha valid predicate it doesnt work but fail with `"Validation of predicate downloads not implemented."`
If so we should probably remove the example of using predicates from the docs
*/