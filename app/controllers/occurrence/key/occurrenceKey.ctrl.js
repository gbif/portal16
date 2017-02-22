var express = require('express'),
    occurrenceKey = require('./occurrenceKey'),
    imageCacheUrl = rootRequire('app/models/gbifdata/apiConfig').image.url,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/occurrence/:key(\\d+)\.:ext?', function (req, res, next) {
    var key = req.params.key;
    occurrenceKey.getOccurrenceModel(key, res.__).then(function (occurrence) {
        renderPage(req, res, next, occurrence);
    }, function (err) {
        if (err.type == 'NOT_FOUND') {
            next();
        } else {
            next(err);
        }
    });
});

function renderPage(req, res, next, occurrence) {
    try {
        if (req.params.ext == 'debug') {
            res.json(occurrence);
        } else {
            var angularInitData = occurrenceKey.getAngularInitData(occurrence);
            res.render('pages/occurrence/key/occurrenceKey', {
                occurrence: occurrence,
                occurrenceCoreTerms: occurrenceKey.occurrenceCoreTerms,
                angularInitData: angularInitData,
                occurrenceRemarks: occurrenceKey.occurrenceRemarks,
                _meta: {
                    title: 'Occurrence Detail ' + req.params.key,
                    hasTools: true,
                    imageCacheUrl: imageCacheUrl
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
