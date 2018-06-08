let express = require('express'),
    Network = require('../../../models/gbifdata/gbifdata').Network,
    contributors = require('../../dataset/key/contributors/contributors'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router();

module.exports = function(app) {
    app.use('/', router);
};

router.get('/network/:key', networkPage);
router.get('/network/:key/dataset', networkPage);
router.get('/network/:key/metrics', networkPage);

function networkPage(req, res, next) {
    let key = req.params.key;
    Network.get(key, {expand: []}).then(function(network) {
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
    }, function(err) {
        if (err.type == 'NOT_FOUND') {
            next();
        } else {
            next(err);
        }
    });
}

function renderPage(req, res, next, network) {
    helper.renderPage(req, res, next, {
        network: network,
        _meta: {
            title: network.record.title,
            description: network.record.description
        }
    }, 'pages/network/key/seo');
}
