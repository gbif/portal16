var express = require('express'),
    Installation = require('../../../models/gbifdata/gbifdata').Installation,
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
    try {
        if (req.params.ext == 'debug') {
            res.json(installation);
        } else {
            res.render('pages/installation/key/installationKey', {
                installation: installation,
                _meta: {
                    title: 'Installation: ' + req.params.key,
                    customUiView: true
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
