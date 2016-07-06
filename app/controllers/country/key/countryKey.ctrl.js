var express = require('express'),
	Country = require('../../../models/gbifdata/gbifdata').Country,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/country/:key\.:ext?', function(req, res, next) {
	var key = req.params.key;
    Country.get(key, {expand: ['endorsingNode']}).then(function(country) {
        renderPage(req, res, next, country);
    }, function(err){
        //TODO should this be logged here or in model/controller/api?
        //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
        console.log('error in ctrl ' + err);
        next();
    });
});

function renderPage(req, res, next, country) {
    try {
        if (req.params.ext == 'json') {
            res.json(country);
        } else {
            res.render('pages/country/key/countryKey', {
				country: country,
				_meta: {
                    title: 'Country Detail ' + req.params.key
                }
			});
        }
    } catch(e) {
        next(e);
    }
}
