let ERRORS = require('../models/util/api-request').ERRORS;
let STATUS_CODES = require('../models/util/api-request').STATUS_CODES;


function handleErrors(err, req, res, next) {
    if (err && ERRORS[err.type]) {
        res.status(STATUS_CODES[err.type] || 500);
    }

    next();
}


module.exports = handleErrors;
