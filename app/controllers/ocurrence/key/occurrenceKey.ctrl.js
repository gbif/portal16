var express = require('express'),
    occurrenceDetails = require('./occurrenceKey'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/occurrence/:key(\\d+)\.:ext?', function (req, res, next) {
    var occurrenceKey = req.params.key;

    occurrenceDetails.getOccurrenceModel(occurrenceKey).then(function(occurrence) {
        renderPage(req, res, occurrence);
    }, function(){
        //TODO should this be logged here or in model/controller/api?
        //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
        next();
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
