let express = require('express'),
    helper = rootRequire('app/models/util/util'),
    request = rootRequire('app/helpers/request'),
    config = rootRequire('config/config'),
    objectHash = require('object-hash'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

router.get('/occurrence-search/beta', function(req, res, next) {
  // get lib and take hash to serve latest version - https://react-components.gbif.org/lib/gbif-react-components.js
  getReactLibraryHash().
    then(function(hash) {
      helper.renderPage(req, res, next, {_meta: {hideFooter: true}, reactLibraryUrl: `${config.reactComponents}?${hash}`}, 'pages/occurrence/beta/betaSearch.nunjucks');
    }).catch(function(err) {
      console.log(err);
    });
});

async function getReactLibraryHash() {
  let options = {
      url: `http:${config.reactComponents}`,
      method: 'GET',
      fullResponse: true
  };
  let response = await request(options);
  if (response.statusCode !== 200) {
      // TODO log error
      throw 'Internal server error getting data';
  }
  return objectHash(response.body);
}