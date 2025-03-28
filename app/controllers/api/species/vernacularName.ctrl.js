'use strict';
let express = require('express'),
    router = express.Router(),
    vernacularName = require('./vernacularName');


module.exports = function(app) {
    app.use('/api', router);
};

router.get('/species/:key/vernacularName', function(req, res) {
    let namePromise = vernacularName.getVernacularName(req.params.key, req.headers['accept-language']);
    namePromise.then(function(name) {
        if (name) {
            return res.send(name);
        }
        res.status(204);
        res.send();
    }).catch(function() {
        res.status(500);
        res.send();
    });
});

router.get('/species/:key/vernacularNames', function(req, res) {
    let namePromise = vernacularName.getVernacularNamesProcessed(req.params.key);
    namePromise.then(function(name) {
        if (name) {
            return res.send(name);
        }
        res.status(204);
        res.send();
    }).catch(function() {
        res.status(500);
        res.send();
    });
});

