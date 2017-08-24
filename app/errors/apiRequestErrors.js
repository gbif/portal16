var ERRORS = require("../models/util/api-request").ERRORS;
var STATUS_CODES = require("../models/util/api-request").STATUS_CODES;



function handleErrors(err, req, res, next) {

    if (err && ERRORS[err.type]) {

        res.status(STATUS_CODES[err.type] || 500).send(err.type)

    } else {
        next();
    }
}




module.exports = handleErrors;
