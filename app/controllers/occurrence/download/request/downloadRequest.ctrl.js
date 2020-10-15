'use strict';

let express = require('express'),
    router = express.Router(),
    validatePredicate = require('../validatePredicate').validatePredicate;

module.exports = function(app) {
    app.use('/occurrence', router);
};

router.get('/download/request', function(req, res) {
  if (req.query.predicate && req.query.predicate !== '') {
    try {
      let originalPredicate = JSON.parse(req.query.predicate);
      originalPredicate = uppercaseKeys(originalPredicate);
      let parsedResponse = validatePredicate(originalPredicate);
      if (parsedResponse.error) {
        return res.render('pages/occurrence/download/custom/custom.nunjucks', {
          invalidPredicate: true,
          parsingError: parsedResponse.error,
          predicate: req.query.predicate
        });
      }
      return res.render('pages/occurrence/download/custom/custom.nunjucks', {
        predicate: JSON.stringify(originalPredicate),
        invalidPredicate: false
      });
    } catch (err) {
      return res.render('pages/occurrence/download/custom/custom.nunjucks', {
        invalidPredicate: true,
        predicate: req.query.predicate
      });
    }
  } else {
    return res.render('pages/occurrence/download/custom/custom.nunjucks', {});
  }
});

function uppercaseKeys(predicate) {
  if (typeof predicate.key === 'string') {
    predicate.key = predicate.key.toUpperCase();
  }
  if (predicate.predicates) {
    predicate.predicates = predicate.predicates.map(uppercaseKeys);
  }
  return predicate;
}
