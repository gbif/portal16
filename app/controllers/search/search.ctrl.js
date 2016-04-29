var express = require('express'),
    search = require('../../models/search/search'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/search\.:ext?', function (req, res) {
    var searchString = req.query.q;
    search.search(searchString, function(results){
        renderPage(req, res, results, searchString);
    });
});

function renderPage(req, res, results, searchString) {
    if (req.params.ext == 'json') {
        res.json(results);
    } else {
        res.render('pages/search/search', {
            __hideSearchAction: true,
            results: results,
            query: searchString
        });
    }
}
