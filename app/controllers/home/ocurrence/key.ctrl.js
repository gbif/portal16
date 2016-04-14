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

    //var url = "http://api.gbif.org/v1/occurrence/" + occurrenceKey;
    //require('request')(url, function (err, resp, body) {
    //    if (resp.statusCode != 200 || err) {
    //        res.status(404);
    //        next()
    //    } else {
    //        body = JSON.parse(body);
    //        var hasGeoData = body.decimalLongitude && body.decimalLatitude;
    //        res.render('pages/occurrence/key/occurrenceKey', {
    //            occurrence: body,
    //            hasGeoData: hasGeoData,
    //            hasTools: true
    //        });
    //    }
    //});

});
