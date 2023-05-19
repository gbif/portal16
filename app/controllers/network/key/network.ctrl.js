let express = require('express'),
    Network = require('../../../models/gbifdata/gbifdata').Network,
    contributors = require('../../dataset/key/contributors/contributors'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router({ caseSensitive: true }),
    resource = require('../../resource/key/resourceKey'),
    _ = require('lodash');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/network/:key', networkPage);
router.get('/network/:key/dataset', networkPage);
router.get('/network/:key/publisher', networkPage);
router.get('/network/:key/metrics', networkPage);

async function networkPage(req, res, next) {
    let key = req.params.key;
    try {
        let network = await Network.get(key, { expand: [] });
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

        try {
            let networkProse = await resource.getFirst({
                'content_type': 'network',
                'fields.networkKey': key
            }, 2, false, res.locals.gb.locales.current);
            network._prose = networkProse;
        } catch (error) {
            // do nothing
        }

        renderPage(req, res, next, network);
    } catch (err) {
        if (err.type == 'NOT_FOUND') {
            next();
        } else {
            next(err);
        }
    }
}

function renderPage(req, res, next, network) {
    helper.renderPage(req, res, next, {
        network: network,
        _meta: {
            noIndex: network.deleted,
            title: _.get(network, '_prose.main.fields.title') || network.record.title,
            description: _.get(network, '_prose.main.fields.description') || network.record.description,
        }
    }, 'pages/network/key/seo');
}
