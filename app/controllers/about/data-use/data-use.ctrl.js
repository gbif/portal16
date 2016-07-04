var express = require('express'),
    router = express.Router(),
    baseConfig = require('../../../../config/config'),
    request = require('request');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/data-use/:key', function(req, res, next) {
    var datauseUrl = baseConfig.cmsApi + 'data_use/' + req.params.key;
    request(datauseUrl, function(error, response, body) {
        if (error) {
            next(error);
        }
        else if (response.statusCode == 200){
            try {
                body = JSON.parse(body);
                res.render('pages/about/data-use/data-use.nunjucks', {
                    data: body.data[0],
                    images: body.data[0].images,
                    self: body.self,
                    meta: {
                        title: body.data[0].title
                    },
                    hasTools: true
                });
            } catch(e) {
                next(e);
            }
        }
        else if (400 <= response.statusCode && response.statusCode < 500) {
            next();
        } else {
            next({
                status: response.statusCode,
                message: 'Something went wrong while trying to display data use item: ' + req.params.key
            });
        }
    });
});
