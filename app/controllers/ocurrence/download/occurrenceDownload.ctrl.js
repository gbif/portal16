var express = require('express'),
    Download = require('../../../models/gbifdata/gbifdata').Download,
    router = express.Router();

module.exports = function (app) {
    app.use('/occurrence', router);
};

router.get('/download/:key\.:ext?', function (req, res, next) {
    var key = req.params.key;
    Download.get(key).then(function (download) {
        renderPage(req, res, next, download);
    }, function (err) {
        next(err);
    });
});

function renderPage(req, res, next, download) {
    try {
        if (req.params.ext == 'debug') {
            res.json(download);
        } else {
            res.render('pages/occurrence/download/key/occurrenceDownloadKey', {
                download: download,
                title: 'Ocurrences',
                _meta: {
                    title: res.__('stdTerms.download')
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
