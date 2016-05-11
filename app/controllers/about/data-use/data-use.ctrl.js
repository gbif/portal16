var express = require('express'),
    router = express.Router(),
    baseConfig = require('../../../../config/config');
    request = require('request');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/data-use/:key', function(req, res) {
    request(baseConfig.cmsApi + 'datause/' + req.params.key, function(error, response, body) {
        if (response.statusCode !== 200) {
            res.send('Something went wrong from the Content API.');
        }
        else {
            body = JSON.parse(body);
            res.render('pages/about/data-use/data-use2.nunjucks', {
                data: body.data[0],
                images: body.data[0].images,
                self: body.self,
                hasTitle: true,
                meta: {
                    title: body.data[0].title
                },
                hasTools: true
            });
        }
    });
});
