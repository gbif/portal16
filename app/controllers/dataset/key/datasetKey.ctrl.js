'use strict';

let express = require('express'),
    utils = rootRequire('app/helpers/utils'),
    _ = require('lodash'),
    helper = rootRequire('app/models/util/util'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    request = rootRequire('app/helpers/request'),
    router = express.Router({caseSensitive: true});

module.exports = function(app) {
    app.use('/', router);
};

router.get('/dataset/:key', render);
// router.get('/dataset/:key/taxonomy', render);
router.get('/dataset/:key/activity', render);
router.get('/dataset/:key/project', render);
router.get('/dataset/:key/metrics', render);
router.get('/dataset/:key/constituents', render);
router.get('/dataset/:key/event/:eventKey', render);
router.get('/dataset/:key/parentevent/:parentEventKey', render);


function render(req, res, next) {
    let datasetKey = req.params.key;
    if (!utils.isGuid(datasetKey)) {
        next();
        return;
    }
    getDataset(datasetKey)
        .then(function(dataset) {
            let contentItem = {
                // key: req.params.key,
                dataset: dataset,
                _meta: {
                    title: dataset.title,
                    description: dataset.description,
                    schema: getMetaSchema(dataset)
                }
            };
            helper.renderPage(req, res, next, contentItem, 'pages/dataset/key/seo');
        })
        .catch(function(err) {
            if (err.statusCode == 404) {
                next();
            } else {
                next(err);
            }
        });
}

async function getDataset(key) {
    let dataset = await getData(apiConfig.dataset.url, key);
    dataset.publisher = await getData(apiConfig.publisher.url, dataset.publishingOrganizationKey);
    return dataset;
}

async function getData(url, key) {
    let options = {
        url: url + key,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

function getMetaSchema(dataset) {
    let authors = _.filter(dataset.contacts, {type: 'ORIGINATOR'}).map(function(contact) {
        let c = {
            '@type': 'Person',
            'givenName': contact.firstName,
            'familyName': contact.lastName,
            'email': contact.email[0],
            'telephone': contact.phone[0],
            'jobTitle': contact.position,
            'address': {
                '@type': 'PostalAddress',
                'streetAddress': contact.address,
                'addressLocality': contact.city,
                'postalCode': contact.postalCode,
                'addressRegion': contact.province,
                'addressCountry': contact.country
            }
        };

        if (contact.organization) {
            c.affiliation = {
                '@type': 'Organization',
                'name': contact.organization
            };
        }
        return c;
    });

    let schema = {
        '@context': 'http://schema.org',
        '@type': 'Dataset',
        '@id': 'https://doi.org/' + dataset.doi,
        'identifier': [
          {
            '@type': 'PropertyValue',
            'propertyID': 'doi',
            'value': 'https://doi.org/' + dataset.doi
          },
          {
            '@type': 'PropertyValue',
            'propertyID': 'UUID',
            'value': dataset.key
          }
        ],
        'url': 'https://www.gbif.org/dataset/' + dataset.key,
        'name': dataset.title,
        'author': authors,
        'description': dataset.description,
        'license': dataset.license,
        'inLanguage': dataset.dataLanguage,
        'datePublished': dataset.created,
        'dateModified': dataset.modified,
        'publisher': {
            '@type': 'Organization',
            'name': dataset.publisher.title,
            'url': _.get(dataset, 'publisher.homepage[0]')
          },
        'provider': {
          '@type': 'Organization',
            'name': 'GBIF',
            'url': 'https://www.gbif.org',
            'logo': 'https://www.gbif.org/img/logo/GBIF50.png',
            'email': 'info@gbif.org',
            'telephone': '+45 35 32 14 70'
        }
    };
    return schema;
}
