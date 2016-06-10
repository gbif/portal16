var express = require('express'),
	Installation = require('../../../models/gbifdata/gbifdata').Installation
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/installation/:key\.:ext?', function(req, res, next) {
	var key = req.params.key;
    Installation.get(key, {expand: ['endorsingNode']}).then(function(installation) {
        renderPage(req, res, next, installation);
    }, function(err){
        //TODO should this be logged here or in model/controller/api?
        //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
        console.log('error in ctrl ' + err);
        next();
    });
});

function renderPage(req, res, next, installation) {
    try {
        if (req.params.ext == 'json') {
            res.json(installation);
        } else {
            res.render('pages/installation/key/installationKey', {
				installation: installation,
				meta: {
                    title: 'Installation: ' + req.params.key
                }
			});
        }
    } catch(e) {
        next(e);
    }
}
