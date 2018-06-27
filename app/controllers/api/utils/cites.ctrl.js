'use strict';
let express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    apiConfig = rootRequire('/app/models/gbifdata/apiConfig'),
    cites = rootRequire('config/credentials').CITES,
    request = require('requestretry');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/cites/:kingdom/:name', function(req, res) {
    let name = req.params.name,
        kingdom = req.params.kingdom;

    getCitesStatus(name).then(function(data) {
        if (data.pagination.total_entries > 0) {
            // just to have some assurance that it is in fact the same species we are talking about since we only match on canonical name
            let matchedTaxon = _.find(data.taxon_concepts, function(e) { // ['higher_taxa.kingdom', kingdom]
                return _.get(e, 'higher_taxa.kingdom', '').toLowerCase() == kingdom.toLowerCase();
            });
            if (matchedTaxon) {
                decorateTaxon(matchedTaxon);
                res.status(200).json(matchedTaxon);
                return;
            }
        }
        // no entries found or it didn't match kingdom
        res.status(404).send('No entry found');
    }, function(err) {
        res.status(err.statusCode || 500);
        res.send('unable to process');
    });
});

async function getCitesStatus(name) {
    let options = {
        url: apiConfig.citesName.url + '?name=' + name,
        method: 'GET',
        headers: {
            'X-Authentication-Token': cites.token
        },
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

function decorateTaxon(taxon) {
    taxon._reference = 'https://speciesplus.net/#/taxon_concepts/' + taxon.id + '/legal';
}
