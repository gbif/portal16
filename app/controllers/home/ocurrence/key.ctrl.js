var express = require('express'),
    occurrenceModel = require('../../../models/occurrence/key/occurrenceKey'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/occurrence/:key', function (req, res, next) {
    var occurrenceKey = req.params.key;

    occurrenceModel.get(occurrenceKey, function(result){
        res.render('pages/occurrence/key/occurrenceKey', {
            occurrence: result.occurrenceRecord,
            publisher: result.publisher,
            dataset: result.dataset,
            hasTools: true
        });
    });
});

