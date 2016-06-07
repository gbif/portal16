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
    request('https://api.forecast.io/forecast/a5a201e1758bb93ad4b2ff166f1bc7bb/'+lat+','+lng+','+unix+'?units=si', function(error, response, body) {
        if (response.statusCode !== 200) {
            res.status(500);
            res.send('Something went wrong from the weather API.');
        }
        else {
            body = JSON.parse(body);
            res.json(body);
        }
    });
    //res.json(test);
});

var test = {
    "latitude": 29.31,
    "longitude": -82.43,
    "timezone": "America/New_York",
    "offset": -5,
    "currently": {
        "time": 1453244400,
        "summary": "Clear",
        "icon": "clear-night",
        "precipIntensity": 0,
        "precipProbability": 0,
        "temperature": 9,
        "apparentTemperature": 8.42,
        "dewPoint": -4.73,
        "humidity": 0.37,
        "windSpeed": 1.59,
        "windBearing": 18,
        "visibility": 16.09,
        "cloudCover": 0,
        "pressure": 1028.4
    },
    "hourly": {},
    "daily": {
        "data": [
            {
                "time": 1453179600,
                "summary": "Clear throughout the day.",
                "icon": "clear-day",
                "sunriseTime": 1453206328,
                "sunsetTime": 1453244242,
                "moonPhase": 0.35,
                "precipIntensity": 0,
                "precipIntensityMax": 0,
                "precipProbability": 0,
                "temperatureMin": 1.62,
                "temperatureMinTime": 1453208400,
                "temperatureMax": 12.17,
                "temperatureMaxTime": 1453237200,
                "apparentTemperatureMin": -1.24,
                "apparentTemperatureMinTime": 1453208400,
                "apparentTemperatureMax": 12.17,
                "apparentTemperatureMaxTime": 1453237200,
                "dewPoint": -2.71,
                "humidity": 0.58,
                "windSpeed": 2.36,
                "windBearing": 355,
                "visibility": 16.05,
                "cloudCover": 0,
                "pressure": 1029.01
            }
        ]
    },
    "flags": {
        "sources": [
            "isd"
        ],
        "isd-stations": [
            "720655-99999",
            "722012-92817",
            "722055-12861",
            "747560-12816",
            "994640-99999"
        ],
        "units": "si"
    }
};
