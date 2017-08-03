var express = require('express'),
    Publisher = require('../../../models/gbifdata/gbifdata').Publisher,
    helper = rootRequire('app/models/util/util'),
    contributors = require('../../dataset/key/contributors/contributors'),
    authOperations = require('../../auth/gbifAuthRequest'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    log = require('../../../../config/log'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

function isGuid(stringToTest) {
    var regexGuid = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/gi;
    return regexGuid.test(stringToTest);
}

module.exports = function (app) {
    app.use('/', router);
};

router.get('/publisher/confirm', confirm);
router.get('/publisher/:key\.:ext?', render);


function render(req, res, next) {
    var key = req.params.key;
    if (!isGuid(key)) {
        next();
    } else {
        Publisher.get(key).then(function (publisher) {
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
                        title: publisher.record.title,
                        description: publisher.record.description
                    }
                }, 'pages/publisher/key/seo');
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
}

function confirm(req, res, next) {
    var key = req.query.key;
    var code = req.query.code;

    let opts = {
        method: 'POST',
        body: {"confirmationKey": code},
        url: apiConfig.publisherCreate.url + key + "/endorsement",
        canonicalPath: apiConfig.publisherCreate.canonical + key + "/endorsement"

    };


    return authOperations.authenticatedRequest(opts)
        .then(function(response){
            console.log(JSON.stringify(response))
            if (response.statusCode !== 204) {
                throw response;
            }
          return  helper.renderPage(req, res, next, {
                publisherKey: key
            }, 'pages/custom/confirmEndorsement/confirmEndorsement');
        })
        .catch(function(err){
            log.error("Failed to confirm endorsement for organization["+key+"] : "+err.body)
            return  helper.renderPage(req, res, next, {
                publisherKey: key
            }, 'pages/custom/confirmEndorsement/invalidToken');

        });

}