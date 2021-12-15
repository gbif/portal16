'use strict';
let express = require('express'),
    router = express.Router(),
    blast = require('./blast'),
    _ = require('lodash');


module.exports = function(app) {
    app.use('/api', router);
};

router.post('/blast', function(req, res) {
    blast.blast(req.body, _.get(req, 'query.verbose', false))
    .then((response) => res.status(200).json(response))
    .catch((err) => {
        console.log(err);
        res.sendStatus(503);
    });
});
