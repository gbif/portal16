var express = require('express'),
    //request = require('request')
    router = express.Router();

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/weather/:lat/:lng/:unix', function (req, res) {
    //var lat = req.params.lat,
    //    lng = req.params.lng,
    //    unix = req.params.unix;
        res.send('Something went wrong from the weather API.');
        // request('https://api.forecast.io/forecast/a5a201e1758bb93ad4b2ff166f1bc7bb/'+lat+','+lng+','+unix+'?units=si', function(error, response, body) {
        //     console.log(body);
        //     if (response.statusCode !== 200) {
        //         res.send('Something went wrong from the weather API.');
        //     }
        //     else {
        //         body = JSON.parse(body);
        //         res.json(body);
        //     }
        // });
});

//function renderPage(res, occurrence) {
//    res.json('pages/occurrence/key/occurrenceKey', {
//        occurrence: occurrence,
//        hasTools: true
//    });
//}