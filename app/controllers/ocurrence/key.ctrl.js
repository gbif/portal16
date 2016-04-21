var express = require('express'),
    occurrenceDetails = require('./occurrenceDetails'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/occurrence/:key\.:ext?', function (req, res) {
    var occurrenceKey = req.params.key;

    occurrenceDetails.getOccurrenceModel(occurrenceKey).then(function(occurrence) {
        renderPage(req, res, occurrence);
    }, function(err){
        console.log('error from expand: ' + err); //TODO
        renderPage(req, res, err);
    });
});

function renderPage(req, res, occurrence) {
    if (req.params.ext == 'json') {
     res.json(occurrence);
    } else {
        var angularInitData = occurrence.record;//occurrenceDetails.getAngularInitData(occurrence);
        res.render('pages/occurrence/key/occurrenceKey', {
            occurrence: occurrence,
            occurrenceFields: occurrenceDetails.occurrenceFields,
            angularInitData: angularInitData,
            hasTools: true
        });
    }
}
