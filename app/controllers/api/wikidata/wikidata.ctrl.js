'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    request = require('request-promise'),
    log = require('../../../../config/log');
const wdk = require('wikibase-sdk')({
    instance: 'https://www.wikidata.org',
    sparqlEndpoint: 'https://query.wikidata.org/sparql'
});

const REDLIST_CATEGORIES = {'LC': true, 'NT': true, 'VU': true, 'EN': true, 'CR': true, 'EW': true, 'EX': true, 'NE': true, 'DD': true};

const WIKI_GBIF_IDENTIFIER = 'P846';
const URL_TEMPLATE = 'P1630';
const IUCN_TAXON_IDENTIFIER = 'P627';
const IUCN_CONSERVATION_STATUS = 'P141';

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/wikidata/species/:key', function(req, res) {
      return getIdentifiers(req, res)
        .then((response) => {
            return res.status(200).json(response);
        })
        .catch(function(err) {
            log.error(err);
            let status =
                err.message === 'not found'
                    ? 404
                    : err.statusCode
                    ? err.statusCode
                    : 500;
            res.sendStatus(status);
        });
});

const getIdentifiers = async (req, res) => {
    const url = wdk.getReverseClaims(WIKI_GBIF_IDENTIFIER, req.params.key, {
        keepProperties: true
    });
    const reverseClaimResponse = await request({
        url: url,
        headers: {
            'User-Agent': req.header('User-Agent')
        }
    });
    const entitiesIds = wdk.simplify.sparqlResults(reverseClaimResponse);
    if (entitiesIds.length === 0) {
        throw new Error('not found');
    }
    const wikidataId = _.get(entitiesIds, '[0].subject');
    const entityUrl = wdk.getEntities(entitiesIds.map((e) => e.subject));
    const entityResponse = await request({
        url: entityUrl,
        json: true,
        headers: {
            'User-Agent': req.header('User-Agent')
        }
    });
    const keys = Object.keys(entityResponse.entities);
    const claims = _.get(entityResponse.entities, `${keys[0]}.claims`) || [];
    const claimKeys = Object.keys(claims);
    const externalIds = claimKeys
        .filter(
            (k) => _.get(claims, `${k}[0].mainsnak.datatype`) === 'external-id'
        )
        .map((k) => _.get(claims, `${k}[0]`));

    const identifiers = await decorateWithPropertyDescriptions(externalIds, req);
    const iucnIdentifier = await decorateWithPropertyDescriptions(claimKeys
        .filter(
            (k) => k === IUCN_TAXON_IDENTIFIER
        )
        .map((k) => _.get(claims, `${k}[0]`)), req);
    const iucnThreatStats = await getIUCNThreatStatus(claimKeys
        .filter(
            (k) => k === IUCN_CONSERVATION_STATUS
        )
        .map((k) => _.get(claims, `${k}[0]`)), req);
    return {
        wikidataId: wikidataId,
        wikidataUrl: `https://www.wikidata.org/wiki/${wikidataId}`,
        identifiers: identifiers,
        iucnIdentifier: iucnIdentifier,
        iucnThreatStatus: iucnThreatStats
    };
};

const decorateWithPropertyDescriptions = async (properties, req) => {
    if (properties.length === 0) {
        return '';
    }
    const locale = _.get(req, 'query.locale');
    const urls = wdk.getManyEntities(
        properties.map((k) => _.get(k, `mainsnak.property`))
    );

  const responses = await Promise.all(urls.map((url) => request({
        url: url,
        json: true,
        headers: {
            'User-Agent': req.header('User-Agent')
        }
    })));
    const res = _.merge({}, ...responses);
        return properties.map((p) => ({
            id: _.get(p, 'mainsnak.datavalue.value'),
            url: _.get(
                res,
                `entities.${
                    p.mainsnak.property
                }.claims.${URL_TEMPLATE}[0].mainsnak.datavalue.value`
            )
                ? _.get(
                      res,
                      `entities.${
                          p.mainsnak.property
                      }.claims.${URL_TEMPLATE}[0].mainsnak.datavalue.value`
                  ).replace('$1', p.mainsnak.datavalue.value)
                : '',
            label: _.get(
                res,
                `entities.${p.mainsnak.property}.labels.${locale}`
            )
                ? _.get(res, `entities.${p.mainsnak.property}.labels.${locale}`)
                : _.get(res, `entities.${p.mainsnak.property}.labels.en`),
            description: _.get(
                res,
                `entities.${p.mainsnak.property}.descriptions.${locale}`
            )
                ? _.get(
                      res,
                      `entities.${p.mainsnak.property}.descriptions.${locale}`
                  )
                : _.get(res, `entities.${p.mainsnak.property}.descriptions.en`)
        }));
};

const getIUCNThreatStatus = async (properties, req) => {
    const threatStatus = properties[0];
    if (!threatStatus) {
        return '';
    }
    const locale = _.get(req, 'query.locale');
    const url = wdk.getEntities(
        properties.map((k) => _.get(k, `mainsnak.property`))
    );
    const res = await request({
        url: url,
        json: true,
        headers: {
            'User-Agent': req.header('User-Agent')
        }
    });

    const value = await resolveWikiDataItem(_.get(threatStatus, 'mainsnak.datavalue.value.id'), req);
    return {
            abbrevation: _.find(value.aliases, (a) => REDLIST_CATEGORIES[a.value] === true),
            value: value,
            label: _.get(
                res,
                `entities.${threatStatus.mainsnak.property}.labels.${locale}`
            )
                ? _.get(res, `entities.${threatStatus.mainsnak.property}.labels.${locale}`)
                : _.get(res, `entities.${threatStatus.mainsnak.property}.labels.en`),
            description: _.get(
                res,
                `entities.${threatStatus.mainsnak.property}.descriptions.${locale}`
            )
                ? _.get(
                      res,
                      `entities.${threatStatus.mainsnak.property}.descriptions.${locale}`
                  )
                : _.get(res, `entities.${threatStatus.mainsnak.property}.descriptions.en`)
        };
};

const resolveWikiDataItem = async (id, req) => {
    const locale = _.get(req, 'query.locale');
    const url = wdk.getEntities(
       [id]
    );
    const res = await request({
        url: url,
        json: true,
        headers: {
            'User-Agent': req.header('User-Agent')
        }
    });
    return {
        label: _.get(
            res,
            `entities.${id}.labels.${locale}`
        )
            ? _.get(res, `entities.${id}.labels.${locale}`)
            : _.get(res, `entities.${id}.labels.en`),
        description: _.get(
            res,
            `entities.${id}.descriptions.${locale}`
        )
            ? _.get(
                  res,
                  `entities.${id}.descriptions.${locale}`
              )
            : _.get(res, `entities.${id}.descriptions.en`),

        aliases: _.get(res, `entities.${id}.aliases.en`) // Only en locale, to find ThreatStatus abbrevations
    };
};
