// var express = require('express'),
// 	router = express.Router();

// module.exports = function (app) {
// 	app.use('/', router);
// };

// router.get('/species/:key', function (req, res, next) {
// 	var speciesKey = req.params.key;
// 	var url = "http://api.gbif.org/v1/species/" + speciesKey;

// 	require('request')(url, function(err, resp, body) {
// 		//should have better error handling
// 		if (resp.statusCode != 200 || err) {
// 			res.status(404);
// 			next()
// 		} else {
// 			body = JSON.parse(body);
// 			// process response if neccessary
// 			// pass back the results to client side
// 			res.render('pages/species/key/speciesKey', {
// 				species: body
// 			});
// 		}
// 	});
// });


var express = require('express'),
	Taxon = require('../../../models/gbifdata/gbifdata').Taxon
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/species/:key(\\d+)\.:ext?', taxonRoute);
router.get('/taxon/:key(\\d+)\.:ext?', taxonRoute);

function taxonRoute(req, res, next) {
	var key = req.params.key;
    Taxon.get(key, {expand: ['dataset']}).then(function(taxon) {
        renderPage(req, res, next, taxon);
    }, function(err){
        //TODO should this be logged here or in model/controller/api?
        //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
        console.log('error in ctrl ' + err);
        next();
    });
}

function renderPage(req, res, next, taxon) {
    try {
        if (req.params.ext == 'json') {
            res.json(taxon);
        } else {
            res.render('pages/species/key/speciesKey', {
				species: taxon,
				meta: {
                    title: 'Taxon Detail ' + req.params.key
                }
			});
        }
    } catch(e) {
        next(e);
    }
}
