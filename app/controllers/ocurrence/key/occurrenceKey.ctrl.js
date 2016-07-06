var express = require('express'),
    occurrenceKey = require('./occurrenceKey'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/occurrence/:key(\\d+)\.:ext?', function (req, res, next) {
    var key = req.params.key;
    occurrenceKey.getOccurrenceModel(key, res.__).then(function(occurrence) {
        renderPage(req, res, next, occurrence);
    }, function(err){
        //TODO should this be logged here or in model/controller/api?
        //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
        console.log('error in ctrl ' + err);
        next();
    });
});

function renderPage(req, res, next, occurrence) {
    try {
        if (req.params.ext == 'json') {
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
                    hasTools: true
                }
            });
        }
    } catch(e) {
        next(e);
    }
}
