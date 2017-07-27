module.exports = function (app) {
    /**
     * In development show as an error.
     */
    if (app.locals.ENV_DEVELOPMENT) {
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
    }

    /**
     * In production show 404s as a nice page with navigation to other relevant pages that might have interest.
     */
    app.use(function (req, res) {
        //TODO needs implementation this is the 404 page the users will see
        res.status(404);
        res.render('error/404/404', {
            title: '404',
            message: 'Page missing and some content for navigation. everything is expected to work',
            _meta: {
                title: 'Page Not Found',
                state: 404
            }
        });
    });
};