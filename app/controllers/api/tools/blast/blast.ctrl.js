'use strict';
let express = require('express'),
    router = express.Router(),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    scientificName = require('../../species/scientificName.ctrl'),
    rt = require('requestretry');


module.exports = function(app) {
    app.use('/api', router);
};

router.post('/blast', function(req, res) {
    let url = 'http://localhost:9000/blast';
    rt({method: 'POST', url: url, body: req.body, json: true})
        .then(function(response) {
            if (response.body.matchType) {
                decorateWithGBIFspecies(response.body).then(function(e) {
                    res.status(200).json(e);
                }).catch(function(err) {
                    res.status(200).json(response.body);
                });
            } else {
                res.status(200).json(response.body);
            }
        })
        .catch(function(err) {
            console.log(err);
            res.sendStatus(503);
        });
});

async function decorateWithGBIFspecies(e) {
    let url = apiConfig.taxon.url + 'match2?name=' + e.name;
    let nub = await rt({method: 'GET', url: url, json: true});
    e.nubMatch = nub.body;
    if (e.nubMatch && e.nubMatch.usage) {
        let formatted = await scientificName.getParsedName(e.nubMatch.usage.key);
        e.nubMatch.usage.formattedName = formatted;
        return e;
    } else {
        return e;
    }
}

