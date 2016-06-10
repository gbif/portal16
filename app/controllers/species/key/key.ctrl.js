var express = require('express'),
	router = express.Router();

module.exports = function (app) {
	app.use('/', router);
};

router.get('/species/:key', function (req, res, next) {
	var speciesKey = req.params.key;
	var url = "http://api.gbif.org/v1/species/" + speciesKey;

	require('request')(url, function(err, resp, body) {
		//should have better error handling
		if (resp.statusCode != 200 || err) {
			res.status(404);
			next()
		} else {
			body = JSON.parse(body);
			// process response if neccessary
			// pass back the results to client side
			res.render('pages/species/key/speciesKey', {
				species: body
			});
		}
	});
});
