'use strict';
let compose = require('composable-middleware');
let url = require('url');
let changeCase = require('change-case');
let _ = require('lodash');

module.exports = rewriteParamCase;

/**
 * The different sites have used different casing over time. This middleware will rewrite the casing to the current standard
 */
function rewriteParamCase(params, caseType) {
  return compose()
    .use(function (req, res, next) {
      let query = req.query,
        pathName = req.originalUrl.split('?').shift(),
        newCaseQuery = {},
        different = false;

      // if no list provided, then rewrite all params
      let paramsToRewrite = params || Object.keys(query);

      // if casetype is not defined on unknown, use snake case
      if (changeCase[caseType] === undefined) {
        caseType = 'snakeCase';
      }

      _.forEach(query, function (value, key) {
        if (value === undefined) {
          return;
        }
        if (paramsToRewrite.indexOf(key) === -1) {
          newCaseQuery[key] = value;
          return;
        } else {
          let newKey = changeCase[caseType](key);
          newCaseQuery[newKey] = value;
          different = different || key !== newKey;
        }
      });

      if (different) {
        res.redirect(302, url.format({
          pathname: pathName,
          query: newCaseQuery
        }
        ));
        return;
      } else {
        next();
      }
    });
}