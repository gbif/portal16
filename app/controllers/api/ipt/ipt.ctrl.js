"use strict";
let express = require('express'),
    router = express.Router(),
    ipt = require('./ipt.model');

module.exports = function (app) {
    app.use('/api/ipt', router);
};

router.get('/stats', function (req, res) {
    ipt.stats()
        .then(function(result){
            res.json(result);
        })
        .catch(function(err){
            res.status(500);
            res.send('failed to create stats');
        });
});