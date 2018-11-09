'use strict';
let express = require('express'),
    router = express.Router(),
    request = rootRequire('app/helpers/request'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig');


module.exports = function(app) {
    app.use('/api', router);
};


// router.get('/species/:key/combinations', getCombinations);

router.get('/dwc/extensions/', function(req, res) {
    let baseRequest = {
        url: apiConfig.dwcextensions.url,
        timeout: 30000,
        method: 'GET',
        json: true,
        fullResponse: true
    };
    return request(baseRequest)
        .then(function(response) {
            let extensions = response.body.extensions;

            let mapped = {};

            for (let i = 0; i < extensions.length; i++) {
                if (extensions[i].isLatest) {
                    mapped[extensions[i].identifier] = extensions[i];
                }
            }
            return res.status(200).json(mapped);
        })
        .catch(function(err) {
            res.status(500);
            res.send();
            console.trace(err);// TODO log properly, but since none is set up the informative logging at the moment is unfortunately console logs
        });
});


