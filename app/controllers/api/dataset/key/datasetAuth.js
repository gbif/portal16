'use strict';
let apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
 //   querystring = require('querystring'),
    compose = require('composable-middleware'),
    utils = rootRequire('app/helpers/utils'),
    request = rootRequire('app/helpers/request'),
    _ = require('lodash');

module.exports = {permissions: getPermissions, isTrustedContact: isTrustedContact};

/**
 * Is the user a trusted dataset contact
 * Otherwise returns 401
 */
function isTrustedContact() {
    return compose()
        .use(function(req, res, next) {
            let datasetKey = req.params.key;
            if (!utils.isGuid(datasetKey)) {
                res.status(401);
                res.send('Not a trusted dataset contact');
                return;
            } else {
                getPermissions(req.user, datasetKey)
                    .then(function(permissionStatus) {
                        if (permissionStatus.isTrustedContact) {
                            next();
                        } else {
                            res.status(401);
                            res.send('Not a trusted dataset contact');
                        }
                    })
                    .catch(function(err) {
                        // TODO log error - this shouldn't happen
                        res.status(500);
                        res.send('Validation failed for unknown reasons - this is likely because of failing endpoints');
                        return;
                    });
            }
        });
}

async function getPermissions(user, datasetKey) {
    if (_.get(user, 'roles', []).indexOf('REGISTRY_ADMIN') !== -1) {
        return {
            isTrustedContact: true,
            isTrustedContactReason: 'Is registry admin'
        };
    }

    // else check to see if listed as a contact with orcid or email
    let dataset = await getItem(apiConfig.dataset.url, datasetKey);
    if (isContact(dataset, user)) {
        return {
            isTrustedContact: true,
            isTrustedContactReason: 'Is dataset contact'
        };
    }
    let publisher = await getItem(apiConfig.publisher.url, dataset.publishingOrganizationKey, true);
    let hostingPromise = getItem(apiConfig.publisher.url, dataset.hostingOrganizationKey, true);
    let installationPromise = getItem(apiConfig.installation.url, dataset.installationKey, true);
    let nodePromise = getItem(apiConfig.country.url, publisher.country, true);
    let otherParties = await Promise.all([installationPromise, nodePromise, hostingPromise]);
    otherParties.push(publisher);
    for (let i = 0; i < otherParties.length; i++) {
        let party = otherParties[i];
        if (isContact(party, user)) {
            return {
                isTrustedContact: true,
                isTrustedContactReason: 'Is contact for associated item : ' + party.title + ' ' + party.key
            };
        }
    }
    return {
        isTrustedContact: false
    };
}

async function getItem(endpoint, key, optional) {
    if (!key) {
        if (optional) return;
        throw new Error('missing key in request');
    }
    let options = {
        method: 'GET',
        url: endpoint + key,
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode === 200 || (optional && response.statusCode === 404)) {
        return response.body;
    }
    // TODO log it - unless wrong datasetkey then This should never happen and means that the endpoint is either offline or the key is non existing. that would mean referential integrety was broken
    throw response;
}

function isMatchingOrcid(orcid, test) {
    return _.isString(orcid) && _.isString(test) && test.replace(/^http(s)?:\/\/orcid\.org\//, '') === orcid;
}

function isMatching(shouldBe, testData, matchingFunction) {
    if (typeof shouldBe === 'undefined' || typeof testData === 'undefined') {
        return false;
    }
    matchingFunction = matchingFunction || function(a, b) {
return a === b;
};
    if (_.isArray(testData)) {
        let matchedItem = _.find(testData, function(o) {
            return matchingFunction(shouldBe, o);
        });
        return typeof matchedItem !== 'undefined';
    } else {
        return matchingFunction(shouldBe, testData);
    }
}

function isContact(item, user) {
    let contacts = _.get(item, 'contacts', []);
    let matchedContact = _.find(contacts, function(contact) {
        return isMatching(user.email, contact.email) || isMatching(_.get(user, 'systemSettings["auth.orcid.id"]'), contact.userId, isMatchingOrcid);
    });
    return matchedContact;
}
