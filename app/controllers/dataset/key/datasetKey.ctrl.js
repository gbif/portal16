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

router.get('/dataset/doi/:prefix/:suffix', async function(req, res, next) {
  let doi = req.params.prefix + '/' + req.params.suffix;
  try {
    let response = await getData(apiConfig.datasetDoi.url, doi);
    if (response.results.length > 1) {
      // multiple datasets with the same DOI
      res.redirect(302, '../../search?q=' + doi);
    } else if (response.results.length === 1) {
      let key = response.results[0].key;
      res.redirect(302, '../../' + key);
      return;
    } else {
      next();
    }
  } catch (err) {
    next();
  }
});

router.get('/dataset/:key', render);
// router.get('/dataset/:key/taxonomy', render);
router.get('/dataset/:key/phylogenies', render);
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
                    schema: getMetaSchema(dataset),
                    noIndex: dataset.deleted,
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
      if (contact.firstName || contact.lastName) {
        let c = {
          '@type': 'Person',
          'name': `${contact.firstName ? contact.firstName + ' ' : ''}${contact.lastName}`,
          'email': contact.email[0],
          'telephone': contact.phone[0],
          'jobTitle': contact.position,
          'identifier': _.get(contact, 'userId[0]', '').indexOf('//orcid.org/') === -1 ? contact.userId[0] : {'@id': 'https://orcid.org/' + _.get(contact.userId[0].split('//orcid.org/'), '[1]', ''),
          '@type': 'PropertyValue',
          'propertyID': 'https://registry.identifiers.org/registry/orcid',
          'value': 'orcid:' + _.get(contact.userId[0].split('//orcid.org/'), '[1]', ''),
          'url': 'https://orcid.org/' + _.get(contact.userId[0].split('//orcid.org/'), '[1]', '')},
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
      } else if (contact.organization) {
        // The contact has neither first nor last name, but it has organization
        return {
          '@type': 'Organization',
          'name': contact.organization,
          'email': contact.email[0],
          'telephone': contact.phone[0],
          'address': {
              '@type': 'PostalAddress',
              'streetAddress': contact.address,
              'addressLocality': contact.city,
              'postalCode': contact.postalCode,
              'addressRegion': contact.province,
              'addressCountry': contact.country
          }
      };
      } else {
        return undefined;
      }
    }).filter((c) => !!c);

    let keywords = [
      ...dataset.keywordCollections.filter((kc) => _.get(kc, 'thesaurus') && _.get(kc, 'thesaurus', '').indexOf('http://rs.gbif.org/vocabulary/') > -1)
        .map((kc) => kc.keywords.map((k) => ({
          '@type': 'DefinedTerm',
          'name': k,
          'inDefinedTermSet': 'http://rs.gbif.org/vocabulary/' + _.get(_.get(kc, 'thesaurus', '').split('http://rs.gbif.org/vocabulary/'), '[1]', ''),
        }))),
      ...dataset.keywordCollections.filter((kc) => !_.get(kc, 'thesaurus') || _.get(kc, 'thesaurus') === 'N/A')
        .map((kc) => kc.keywords.map((k) => ({
          '@type': 'Text',
          'name': k
        }))),
      ...dataset.keywordCollections.filter((kc) => _.get(kc, 'thesaurus') && _.get(kc, 'thesaurus') !== 'N/A' && _.get(kc, 'thesaurus').indexOf('http://rs.gbif.org/vocabulary/') === -1)
        .map((kc) => kc.keywords.map((k) => ({
          '@type': 'DefinedTerm',
          'name': k,
          'inDefinedTermSet': _.get(kc, 'thesaurus', '')
        })))
    ].flat();


    let schema = {
        '@context': 'https://schema.org/',
        '@type': 'Dataset',
        '@id': 'https://doi.org/' + dataset.doi,
        'http://purl.org/dc/terms/conformsTo': {
            '@type': 'CreativeWork',
            '@id': 'https://bioschemas.org/profiles/Dataset/1.0-RELEASE'
        },
        'identifier': [
          {
            '@id': 'https://doi.org/' + dataset.doi,
            '@type': 'PropertyValue',
            'propertyID': 'https://registry.identifiers.org/registry/doi',
            'value': 'doi:' + dataset.doi,
            'url': 'https://doi.org/' + dataset.doi
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
        'creator': authors,
        'description': dataset.description,
        'license': dataset.license,
        'inLanguage': dataset.dataLanguage,
        'datePublished': dataset.created,
        'dateModified': dataset.modified,
        'publisher': {
            '@type': 'Organization',
            'name': dataset.publisher.title,
            'url': _.get(dataset, 'publisher.homepage[0]'),
            'logo': _.get(dataset, 'publisher.logo')
          },
        'provider': {
          '@type': 'Organization',
            'name': 'GBIF',
            'url': 'https://www.gbif.org',
            'logo': 'https://www.gbif.org/img/logo/GBIF50.png',
            'email': 'info@gbif.org',
            'telephone': '+45 35 32 14 70'
        },
        'keywords': keywords
    };
    if (dataset.temporalCoverages &&
      dataset.temporalCoverages.length > 0 &&
      _.get(dataset, 'temporalCoverages[0].end') &&
      _.get(dataset, 'temporalCoverages[0].start')
      ) {
        schema.temporalCoverage = `${_.get(dataset, 'temporalCoverages[0].start')}/${_.get(dataset, 'temporalCoverages[0].end')}`;
    }

    if (_.get(dataset, 'geographicCoverages[0].boundingBox')) {
      const box = _.get(dataset, 'geographicCoverages[0].boundingBox');
      schema.spatialCoverage = {
          '@type': 'Place',
          'geo': {
              '@type': 'GeoShape',
              'box': `${box.minLatitude} ${box.minLongitude} ${box.maxLatitude} ${box.maxLongitude}`
          }
      };
    }

    return schema;
}
