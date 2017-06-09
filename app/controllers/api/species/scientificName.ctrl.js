"use strict";
var express = require('express'),
    router = express.Router(),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig'),
    request = require('requestretry');


module.exports = function (app) {
    app.use('/api', router);
};

router.get('/species/:key/name', function (req, res) {
    let namePromise = getParsedName(req.params.key);
    namePromise.then(function(name){
        if (name) {
            res.json({n: name});
        } else {
            res.status(204);
            res.send();
        }
    }).catch(function(){
        res.status(500);
        res.send();
    });
});

async function getParsedName(speciesKey) {
    let name = await getName(speciesKey);
    var n = '';
    if (name.genusOrAbove || name.specificEpithet) {
        n += '<i>' + add(name.genusOrAbove) + add(name.specificEpithet) + '</i>';
    }
    if (name.infraSpecificEpithet) {
        n += add(name.rankMarker) + '<i>' + add(name.infraSpecificEpithet) + '</i>';
    }
    if (name.bracketAuthorship || name.bracketYear){
        n += '(' + add(name.bracketAuthorship);
        if (name.bracketAuthorship && name.bracketYear) {
            n += ', ';
        }
        n += add(name.bracketYear) + ')';
    }
    n += add(name.authorship);
    if (name.authorship && name.year) {
        n += ', ';
    }
    n += add(name.year);

    return n;
}

async function getName(speciesKey) {
    let baseRequest = {
        url: apiConfig.taxon.url + speciesKey + '/name',
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };
    let response = await request(baseRequest);
    if (response.statusCode !== 200) {
        throw response;
    }
    return response.body;
}

function add(value) {
    return value ? value + ' ' : '';
}

