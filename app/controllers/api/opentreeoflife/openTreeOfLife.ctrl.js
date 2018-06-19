'use strict';
let express = require('express'),
    router = express.Router(),
    request = require('requestretry'),
    _ = require('lodash'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    log = require('../../../../config/log');


module.exports = function(app) {
    app.use('/api', router);
};


// router.get('/species/:key/combinations', getCombinations);

router.get('/otl/ottid', function(req, res) {
    let canonicalName = req.query.canonicalName;
    let nubKey = req.query.nubKey;

    let baseRequest = {
        url: apiConfig.openTreeOfLife.url + '/tnrs/match_names',
        timeout: 30000,
        method: 'POST',
        json: {'names': [canonicalName], 'do_approximate_matching': false},
        fullResponse: true
    };
    return request(baseRequest)
        .then(function(response) {
           // _.each(response.body.results,)
            let match = _.find(response.body.results, function(r) {
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


// router.get('/otl/newick/:ott_id', function (req, res) {
//
//
//     let ott_id = req.params.ott_id;
//
//     let baseRequest = {
//         url: apiConfig.openTreeOfLife.url +"/tree_of_life/node_info",
//         timeout: 30000,
//         method: 'POST',
//         json: {"ott_id": ott_id, "include_lineage": true},
//         fullResponse: true
//     };
//     return request(baseRequest)
//         .then(function(response){
//
//
//
//             let lineage = response.body.lineage;
//
//             let taxon = response.body.taxon;
//
//
//
//             let ott_ids = _.map( _.filter(lineage, function(a){
//                 return typeof a.taxon !== 'undefined';
//             }), function(t){
//
//                 return t.taxon.ott_id;
//             });
//
//             console.log(response.body.taxon);
//             ott_ids.push(taxon.ott_id)
//
//             return res.status(200).json({ "ott_ids": ott_ids});
//
//         })
//         .catch(function(err){
//             if (err.statusCode !== 200) {
//                 throw err;
//             }
//         });
//
// });


