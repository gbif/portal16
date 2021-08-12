let express = require('express'),
    helper = rootRequire('app/models/util/util'),
    resourceSearch = rootRequire('app/controllers/api/resource/search/resourceSearch'),
    router = express.Router(),
    resource = require('./resourceKey');

module.exports = function(app) {
    app.use('/', router);
};

router.get('/*.:ext?', function(req, res, next) {
    let urlAlias = req.path;
    
    resourceSearch.search({urlAlias: urlAlias, contentType: ['article', 'composition']}, req.__)
      .then(function(response) {
        if (response.count === 1) {
          var entry = response.results[0];
          var contentType = entry.contentType;
          resource.getByAlias(urlAlias, 2, false, res.locals.gb.locales.current, contentType)
            .then(function(contentItem) {
                helper.renderPage(req, res, next, contentItem, 'pages/resource/key/' + contentType + '/' + contentType);
            })
            .catch(function(err) {
                if (err.statusCode == 404) {
                    next();
                } else {
                    next(err);
                }
            });
        }
      })
      .catch(function(err) {
        console.log(err);
      });
    
});
