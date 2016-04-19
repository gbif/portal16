var express = require('express'),
    Occurrence = require('../../models/gbifdata/gbifdata').Occurrence,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/occurrence/:key', function (req, res) {
    var occurrenceKey = req.params.key;

var getOptions = {
    expand: ['publisher', 'dataset', 'fragment']
};
Occurrence.get(occurrenceKey, getOptions).then(function(occurrence) {
        renderPage(res, occurrence);
    }, function(err){
        console.log('error from expand: ' + err); //TODO
        renderPage(res, err);
    });
});

function renderPage(res, occurrence) {
    res.render('pages/occurrence/key/occurrenceKey', {
        occurrence: occurrence,
        hasTools: true
    });
}