'use strict';
let express = require('express'),
    router = express.Router(),
    request = require('request-promise'),
    https = require('https'),
    cors = require('cors'),
    botDetector = require('isbot'),
    _ = require('lodash'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    log = require('../../../../config/log');

const agent = new https.Agent({rejectUnauthorized: false});

module.exports = function(app) {
    app.use('/api', router);
};

/**
 * @param canonicalName the name to match in Open Tree of Life
 * @param nubKey the nubKey of the name we are after - both nubKey and canonicalName must match
 */
router.get('/otl/ottid', cors(), function(req, res) {
    const isBot = botDetector.isbot(req.get("user-agent"));
    if (isBot) return res.status(403).send('Thirdparty endpoints are not available for bots to avoid overloading external services.');

    let canonicalName = req.query.canonicalName;
    let nubKey = req.query.nubKey;

    let baseRequest = {
        url: apiConfig.openTreeOfLife.url + '/tnrs/match_names',
        timeout: 30000,
        method: 'POST',
        json: {'names': [canonicalName], 'do_approximate_matching': false},
        fullResponse: true,
        agent: agent
    };
    return request(baseRequest)
        .then(function(response) {
            let match = _.find(response.results, function(r) {
                return r.name === canonicalName;
            });

            if (!match) {
                return res.sendStatus(404);
            } else {
                let gbifIdMatch = _.find(match.matches[0].taxon.tax_sources, function(s) {
                    let splitted = s.split(':');
                    return splitted[0] === 'gbif' && parseInt(splitted[1]) === parseInt(nubKey);
                });

                if (!gbifIdMatch) {
                    return res.sendStatus(404);
                } else {
                    return res.status(200).json({'ott_id': match.matches[0].taxon.ott_id});
                }
            }
        })
        .catch(function(err) {
            log.error(err);
            let status = err.statusCode || 500;
            res.sendStatus(status);
        });
});

/**
 * Takes an Open Tree of Life Taxon ID, retreives an OTL node ID, and retrieves a Newick tree
 * @param ottid the Open Tree of Life Taxon ID.
 */
router.get('/otl/newick', cors(), async function (req, res) {
    const isBot = isbot(req.get("user-agent"));
    if (isBot) return res.status(403).send('Thirdparty endpoints are not available for bots to avoid overloading external services.');

    let ottid = req.query.ott_id;
    let nodeid = req.query.node_id;
    let baseRequest = {
        url: apiConfig.openTreeOfLife.url + '/tree_of_life/node_info',
        timeout: 90000,
        method: 'POST',
        json: {'ott_id': ottid, 'include_lineage': true},
        fullResponse: true,
        agent: agent
    };
    try {
        if (!nodeid) {
            const response = await request(baseRequest);
            nodeid = response.node_id;
        }
        const treeResponse = await request({
            method: 'POST',
            url: apiConfig.openTreeOfLife.url + '/tree_of_life/subtree',
            json: {'node_id': nodeid},
            agent: agent
        });
        return res.status(200).json(treeResponse);
    } catch (err) {
            let status = err.statusCode || 500;
            res.status(status).send(_.get(err, 'error.message', ''));
    }
});


