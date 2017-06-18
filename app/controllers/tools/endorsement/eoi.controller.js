'use strict';
var auth = require('../../auth/auth.service'),
    eoi = require('./eoi.model');

module.exports = {
    create: create
};

/**
 * Creates a new organization
 */
function create(req, res) {
    eoi.create(req.body)
        .then(function(){
            res.status(201);
            auth.setNoCache(res);
            res.json({type:'CONFIRM_MAIL'});
        })
        .catch(handleError(res, 422));
}




function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(err.statusCode || statusCode);
        res.json(err.body);
    };
}