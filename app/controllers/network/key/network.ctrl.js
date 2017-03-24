var express = require('express'),
    Network = require('../../../models/gbifdata/gbifdata').Network,
    contributors = require('../../dataset/key/contributors/contributors'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/network/:key\.:ext?', function (req, res, next) {
    var key = req.params.key;
    Network.get(key, {expand: []}).then(function (network) {
        try {
            network._computedValues = {};
            let contacts = network.record.contacts;
            let organizationContact = {
                organization: network.record.title,
                city: network.record.city,
                country: network.record.country,
                address: network.record.address,
                province: network.record.province,
                email: network.record.email,
                postalCode: network.record.postalCode
            };
            if (organizationContact.address || organizationContact.email) {
                contacts.push(organizationContact);
            }
            network._computedValues.contributors = contributors.getContributors(contacts);
            renderPage(req, res, next, network);
        } catch (error) {
            next(error);
        }
    }, function (err) {
        next(err);
    });
});

function renderPage(req, res, next, network) {
    try {
        if (req.params.ext == 'debug') {
            res.json(network);
        } else {
            res.render('pages/network/key/networkKey', {
                network: network,
                _meta: {
                    title: 'Network ' + network.record.title,
                    customUiView: true
                }
            });
        }
    } catch (e) {
        next(e);
    }
}
