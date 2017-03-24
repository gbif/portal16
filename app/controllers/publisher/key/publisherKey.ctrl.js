var express = require('express'),
    Publisher = require('../../../models/gbifdata/gbifdata').Publisher,
    contributors = require('../../dataset/key/contributors/contributors'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

function isGuid(stringToTest) {
    var regexGuid = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/gi;
    return regexGuid.test(stringToTest);
}

router.get('/publisher/:key\.:ext?', function (req, res, next) {
    var key = req.params.key;
    if (!isGuid(key)) {
        next();
    } else {
        Publisher.get(key, {expand: ['endorsingNode', 'datasets', 'occurrences', 'installation']}).then(function (publisher) {
            try {
                publisher._computedValues = {};
                let contacts = publisher.record.contacts;
                let organizationContact = {
                    organization: publisher.record.title,
                    city: publisher.record.city,
                    country: publisher.record.country,
                    address: publisher.record.address,
                    province: publisher.record.province,
                    email: publisher.record.email,
                    postalCode: publisher.record.postalCode
                };
                if (organizationContact.address || organizationContact.email) {
                    contacts.push(organizationContact);
                }
                publisher._computedValues.contributors = contributors.getContributors(contacts);
                renderPage(req, res, next, publisher);
            } catch (error) {
                next(error);
            }
        }, function (err) {
            if (err.type == 'NOT_FOUND') {
                next();
            } else {
                next(err);
            }
        });
    }
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
