var express = require('express'),
    Installation = require('../../../models/gbifdata/gbifdata').Installation,
    helper = rootRequire('app/models/util/util'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/installation/:key\.:ext?', function (req, res, next) {
    var key = req.params.key;
    Installation.get(key, {expand: ['endorsingPublisher']}).then(function (installation) {
        renderPage(req, res, next, installation);
    }, function (err) {
        next(err);
    });
});

function renderPage(req, res, next, installation) {
    helper.renderPage(req, res, next, {
        installation: installation,
        _meta: {
            title: installation.record.title,
            description: installation.record.description
        }
    }, 'pages/installation/key/installationKey');
}
