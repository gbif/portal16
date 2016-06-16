var express = require('express'),
	Publisher = require('../../../models/gbifdata/gbifdata').Publisher,
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/publisher/:key\.:ext?', function(req, res, next) {
	var key = req.params.key;
    Publisher.get(key, {expand: ['endorsingNode', 'datasets']}).then(function(publisher) {
        renderPage(req, res, next, publisher);
    }, function(err){
        //TODO should this be logged here or in model/controller/api?
        //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
        console.log('error in ctrl ' + err);
        next();
    });
});

function renderPage(req, res, next, publisher) {
    try {
        if (req.params.ext == 'json') {
            res.json(publisher);
        } else {
            res.render('pages/publisher/key/publisherKey', {
				publisher: publisher,
				meta: {
                    title: 'Publisher Detail ' + req.params.key
                }
			});
        }
    } catch(e) {
        next(e);
    }
}
