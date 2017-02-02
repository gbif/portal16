var express = require('express'),
    router = express.Router();

module.exports = function (app) {
    app.use('/occurrence', router);
};

function renderSearch(req, res) {
    res.render('pages/occurrence/download/key/occurrenceDownloadKey', {
        title: 'Ocurrences',
        _meta: {
            title: res.__('stdTerms.download')
        }
    });
}

router.get('/download/:key', function (req, res) {
    renderSearch(req, res);
});


