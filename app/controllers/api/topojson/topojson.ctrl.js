'use strict';

/**
 * @fileOverview Serve topojson object to the client side, so it's loaded only when used
 */

const express = require('express'),
      router = express.Router(),
      helper = require('../../../models/util/util'),
      _ = require("lodash"),
      worldRobinson = require('./c-robinson-quantized-topo.json');

      //apicache = require('apicache');

//let cache = apicache.middleware;

module.exports = app => {
    app.use('/api', router);
};

router.get('/topojson/world-robinson', (req, res, next) => {
    let options = {'qs': {'gbifRegion':'GLOBAL'}},
        url = 'http://' + req.get('host') + '/api/directory/participants/active';

    helper.getApiDataPromise(url, options)
        .then(participants => {

            // decorate each feature if an active participant is associated with it.
            let keyed = {};
            participants.forEach(p => {
                // only country participant will be shown on map.
                if (p.type !== 'OTHER') {
                    keyed[p.countryCode] = p;
                }
            });
            worldRobinson.objects.tracts.geometries.forEach(geo => {
                if (keyed[geo.properties.ISO2]) {
                    geo.properties = Object.assign(geo.properties, keyed[geo.properties.ISO2]);
                }
            });
            res.json(worldRobinson);
        })
        .catch(e => {
            next(e);
        });
});


router.get('/topojson/world/participants', (req, res, next) => {
    let options = {'qs': {'gbifRegion':'GLOBAL'}};
    let worldTopoJson = require('./world.topo.json');

    helper.getApiDataPromise('http://' + req.get('host') + '/api/directory/participants/count', options)
        .then( count =>{
            return helper.getApiDataPromise('http://' + req.get('host') + '/api/directory/participants/active', options)
        })
        .then(participants => {

            // decorate each feature if an active participant is associated with it.
            let keyed = {};
            participants.forEach(p => {

                // only country participant will be shown on map.
                if (p.type !== 'OTHER') {
                    keyed[p.countryCode] = p;
                }
            });

            worldTopoJson.objects.countries.geometries.forEach(geo => {
                if (keyed[geo.properties.countryCode]) {
                    geo.properties = Object.assign(geo.properties, keyed[geo.properties.countryCode]);
                } ;
            });

            res.json(worldTopoJson);
        })
        .catch(e => {
            next(e);
        });
});


router.get('/topojson/world', (req, res, next) => {
    let worldTopoJson = require('./world.topo.json');
     return res.json(worldTopoJson);
});