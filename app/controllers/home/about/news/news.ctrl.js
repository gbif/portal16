var express = require('express'),
    router = express.Router(),
    request = require('request');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/news/:key', function(req, res) {
    request('http://bko.gbif.org/api/v0.1/news/' + req.params.key, function(error, response, body) {
        if (response.statusCode !== 200) {
            res.send('Something went wrong from the Content API.');
        }
        else {
            body = JSON.parse(body);
            res.render('pages/about/news/news.nunjucks', {
                data: body.data[0],
                image: body.data[0].images[0],
                self: body.self,
                hasTitle: true
            });
        }
    });
});
