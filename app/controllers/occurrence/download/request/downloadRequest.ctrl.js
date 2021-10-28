'use strict';

let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    request = require('../../../../helpers/request'),
    apiConfig = require('../../../../models/gbifdata/apiConfig'),
    validatePredicate = require('../validatePredicate').validatePredicate;

module.exports = function(app) {
    app.use('/occurrence', router);
};

router.get('/download/request', function(req, res, next) {
  if (req.query.predicateId) {
    predicateIdRequestHandler({req, res, next, predicateId: req.query.predicateId});
  } else if (req.query.predicate && req.query.predicate !== '') {
    predicateRequestHandler({req, res, next, predicate: req.query.predicate});
  } else {
    return res.render('pages/occurrence/download/custom/custom.nunjucks', {});
  }
});

async function predicateIdRequestHandler({req, res, next, predicateId}) {
  // get the predicate from graphql
  let query = `
    query($predicate: Predicate){
      occurrenceSearch(predicate: $predicate) {
        _predicate
      }
    }`;

  let options = {
    method: 'GET',
    json: true,
    url: apiConfig.graphQL.url + `?variablesId=${predicateId}&query=${encodeURIComponent(query)}`
  };
  let response = await request(options);
  if (response.statusCode !== 200) {
      throw response;
  }
  // use the predicateRequestHandler to show the page
  let predicateObj = _.get(response.body, 'data.occurrenceSearch._predicate');
  predicateRequestHandler({req, res, next, predicate: JSON.stringify(predicateObj)});
}

function predicateRequestHandler({req, res, next, predicate}) {
  try {
    let originalPredicate = JSON.parse(predicate);
    originalPredicate = uppercaseKeys(originalPredicate);
    originalPredicate = convertRangeType(originalPredicate);
    originalPredicate = convertLikePredicates(originalPredicate);
    let parsedResponse = validatePredicate(originalPredicate);
    if (parsedResponse.error) {
      return res.render('pages/occurrence/download/custom/custom.nunjucks', {
        invalidPredicate: true,
        parsingError: parsedResponse.error,
        predicate: predicate
      });
    }
    return res.render('pages/occurrence/download/custom/custom.nunjucks', {
      predicate: JSON.stringify(originalPredicate),
      invalidPredicate: false
    });
  } catch (err) {
    return res.render('pages/occurrence/download/custom/custom.nunjucks', {
      invalidPredicate: true,
      predicate: predicate
    });
  }
}

function toEnumCase(str) {
  return _.snakeCase(str).toUpperCase();
}
function uppercaseKeys(predicate) {
  if (typeof predicate.key === 'string') {
    predicate.key = toEnumCase(predicate.key);
  }
  if (predicate.predicates) {
    predicate.predicates = predicate.predicates.map(uppercaseKeys);
  }
  if (predicate.predicate) {
    predicate.predicate = uppercaseKeys(predicate.predicate);
  }
  return predicate;
}

const types = [
  {short: 'gte', long: 'greaterThanOrEquals'},
  {short: 'gt', long: 'greaterThan'},
  {short: 'lte', long: 'lessThanOrEquals'},
  {short: 'lt', long: 'lessThan'}
];

function convertRangeType(obj) {
  if (obj.predicate) {
    convertRangeType(obj.predicate);
  } else if (obj.predicates && Array.isArray(obj.predicates)) {
    obj.predicates = obj.predicates.map(convertRangeType);
  } else if (obj.type === 'range') {
    let ps = [];

    types.forEach(function(type) {
      const value = obj.value[type.short];
      if ( typeof value !== 'undefined') {
        ps.push({
          type: type.long,
          key: obj.key,
          value: value
        });
      }
    });

    return {
      type: 'and', predicates: ps
    };
  }
  return obj;
}

function convertLikePredicates(obj) {
  if (obj.predicate) {
    convertLikePredicates(obj.predicate);
  } else if (obj.predicates && Array.isArray(obj.predicates)) {
    obj.predicates = obj.predicates.map(convertLikePredicates);
  } else if (obj.type === 'like') {
    obj.value = obj.value.replace(/[*?]/g, '%');
  }
  return obj;
}
