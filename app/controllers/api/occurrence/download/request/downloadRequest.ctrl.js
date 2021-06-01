'use strict';

let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    queryResolver = require('../../../../occurrence/download/queryResolver'),
    validatePredicate = require('../../../../occurrence/download/validatePredicate').validatePredicate,
    downloadHelper = require('../../../../occurrence/download/downloadKeyHelper');

module.exports = function(app) {
    app.use('/api/occurrence', router);
};

router.get('/downloadRequest.html', function(req, res) {
  try {
    let predicate = JSON.parse(req.query.predicate);
    predicate = uppercaseKeys(predicate);
    let parsedResponse = validatePredicate(predicate);
    if (parsedResponse.error) {
      return res.sendStatus(500);
    }
    // large queries will just be displayed as JSON
    let stringPredicate = JSON.stringify(predicate, null, 2);
    if (stringPredicate.length > 1200) {
      return res.send('<pre>' + stringPredicate + '</pre');
    }
    // smaller queries will show nicely formated
    getTransformedPredicate(predicate, res.__mf).then(function(context) {
      // res.json(context);
      return res.render('pages/occurrence/download/key/predicateOnly', {decoratedPredicate: context.predicate});
    })
    .catch(function(err) {
      console.log(err);
      return res.sendStatus(500);
    });
  } catch (err) {
    // invalid predicate
    console.log(err);
    return res.sendStatus(500);
  }
});

async function getTransformedPredicate(p, __mf) {
  let predicate = JSON.parse(JSON.stringify(p));
  let promiseList = [];
  let context = {};
  context.predicateString = JSON.stringify(predicate, undefined, 2);
  downloadHelper.addChildKeys(predicate);
  downloadHelper.addSyntheticTypes(predicate);
  downloadHelper.setDepths(predicate);
  context.isSimple = downloadHelper.getSimpleQuery(predicate);
  downloadHelper.flattenSameType(predicate);
  downloadHelper.addpredicateResolveTasks(predicate, queryResolver, promiseList, __mf);
  await Promise.all(promiseList);
  context.predicate = predicate;
  return context;
}

function uppercaseKeys(predicate) {
  if (typeof predicate.key === 'string') {
    predicate.key = _.snakeCase(predicate.key).toUpperCase();
  }
  if (predicate.predicates) {
    predicate.predicates = predicate.predicates.map(uppercaseKeys);
  }
  return predicate;
}
