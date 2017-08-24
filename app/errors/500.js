var log = require('../../config/log');

module.exports = function (app) {
    /**
     * In development render full error page with content of error
     */
    if (app.locals.ENV_DEVELOPMENT) {
        app.use(function (err, req, res, next) { //eslint-disable-line no-unused-vars
            // TODO needs implementation
            let errorStatus = err.status || err.statusCode || 500;
            if (err.type == 'NOT_FOUND') {
                errorStatus = 404;
            }

            res.status(errorStatus);
            res.render('error/error', {
                error: err,
                title: 'Error'
            });
        });
    }

    /**
     * In production just return a basic error page without any server information.
     * Likely a static file or something that require very little as there might be something very wrong.
     */
    app.use(function (err, req, res, next) {
        let errorStatus = err.status || err.statusCode || 500;
        if (err.type == 'NOT_FOUND') {
            errorStatus = 404;
        }
        res.status(errorStatus);
        if (errorStatus == 404) {
            res.status(404);
            res.render('error/404/404', {
                title: '404',
                _meta: {
                    title: 'Page Not Found',
                    state: 404
                }
            });
        } else {
            log.error(
                {
                    err: {
                        type: err.type,
                        message: err.message,
                        stack: err.stack
                    }
                }, errorStatus
            );

            res.render('error/500/500', {
                message: 'no server info here. just an excuse',
                error: {},
                title: 'error',
                _meta: {
                    title: 'Page Not Found',
                    state: errorStatus
                }
            });
        }
    });
};
