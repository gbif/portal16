let express = require('express');
let Publisher = require('../../../models/gbifdata/gbifdata').Publisher;
let helper = rootRequire('app/models/util/util');
let utils = rootRequire('app/helpers/utils');
let contributors = require('../../dataset/key/contributors/contributors');
let authOperations = require('../../auth/gbifAuthRequest');
let apiConfig = rootRequire('app/models/gbifdata/apiConfig');
let log = require('../../../../config/log');
let router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

module.exports = function(app) {
    app.use('/', router);
};

router.get('/publisher/confirm', confirm);
router.get('/publisher/:key.:ext?', render);
router.get('/publisher/:key/metrics', render);


function render(req, res, next) {
    let key = req.params.key;
    if (!utils.isGuid(key)) {
        next();
    } else {
        Publisher.get(key).then(function(publisher) {
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
                helper.renderPage(req, res, next, {
                    publisher: publisher,
                    _meta: {
                        title: publisher.record.endorsementApproved ? publisher.record.title : 'New publisher',
                        description: publisher.record.endorsementApproved ? publisher.record.description : '',
                        noIndex: !publisher.record.endorsementApproved
                    }
                }, 'pages/publisher/key/seo');
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
}

function confirm(req, res, next) {
    let key = req.query.key;
    let code = req.query.code;

    let opts = {
        method: 'POST',
        body: {'confirmationKey': code},
        url: apiConfig.publisherCreate.url + key + '/endorsement',
        canonicalPath: apiConfig.publisherCreate.canonical + key + '/endorsement'
    };

    return authOperations.authenticatedRequest(opts)
        .then(function(response) {
            if (response.statusCode !== 204) {
                throw response;
            }
          return helper.renderPage(req, res, next, {
                publisherKey: key
            }, 'pages/custom/confirmEndorsement/confirmEndorsement');
        })
        .catch(function(err) {
            log.error('Failed to confirm endorsement for organization[' + key + '] : ' + err.body);
            return helper.renderPage(req, res, next, {
                publisherKey: key
            }, 'pages/custom/confirmEndorsement/invalidToken');
        });
}
