/**
 * An endpoint to serve historic weather reports. Used by the occurrence page as supplemental information and not crucial.
 */
var express = require('express'),
    request = require('request'),
    router = express.Router();

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/weather/:lat/:lng/:unix', function (req, res) {
    var lat = req.params.lat,
        lng = req.params.lng,
        unix = req.params.unix;
    //TODO move key and url to configuration
    request('https://api.forecast.io/forecast/a5a201e1758bb93ad4b2ff166f1bc7bb/'+lat+','+lng+','+unix+'?units=si', function(error, response, body) {
        if (response.statusCode !== 200) {
            res.status(500);
            //external service that aren't crucial. don't bother with logging.
            res.send('Something went wrong from the weather API.');
        }
        else {
            body = JSON.parse(body);
            res.json(body);
        }
    });
});

