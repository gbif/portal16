var express = require('express'),
    Publisher = require('../../../models/gbifdata/gbifdata').Publisher,
    contributors = require('../../dataset/key/contributors/contributors'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/publisher/:key\.:ext?', function (req, res, next) {
    var key = req.params.key;
    Publisher.get(key, {expand: ['endorsingNode', 'datasets', 'occurrences']}).then(function (publisher) {
        publisher._computedValues = {};
        let contacts = publisher.record.contacts;
        let organizationContact = {
            organization: publisher.record.title,
            city: publisher.record.city,
            country: publisher.record.country,
            address: publisher.record.address,
            postalCode: publisher.record.postalCode,
            type: 'PUBLISHER'
        };
        contacts.push(organizationContact);
        publisher._computedValues.contributors = contributors.getContributors(contacts);
        renderPage(req, res, next, publisher);
    }, function (err) {
        //TODO should this be logged here or in model/controller/api?
        //TODO dependent on the error we should show different information. 404. timeout or error => info about stability.
        console.log('error in ctrl ' + err);
        next();
    });
});

function renderPage(req, res, next, publisher) {
    try {
        if (req.params.ext == 'debug') {
            res.json(publisher);
        } else {
            res.render('pages/publisher/key/publisherKey', {
                publisher: publisher,
                _meta: {
                    title: 'Publisher Detail ' + req.params.key
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
