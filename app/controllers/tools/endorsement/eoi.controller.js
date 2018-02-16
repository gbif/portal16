'use strict';
let auth = require('../../auth/auth.service'),
    log = require('../../../../config/log'),
    eoi = require('./eoi.model');

module.exports = {
    create: create
};

/**
 * Creates a new organization
 */
function create(req, res) {
    eoi.create(req.body)
        .then(function(result) {
            res.status(201);
            auth.setNoCache(res);
            res.json(result);
        })
        .catch(handleError(res, 422));
}


function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
       // throw err;
        res.status(err.statusCode || statusCode);
        log.error('Become a publisher form submission failure: '+err.body);
        res.send();
    };
}
