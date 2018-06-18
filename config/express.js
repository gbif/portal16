let express = require('express'),
    glob = require('glob'),
    passport = require('passport'),
// favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    i18n = require('./i18n'),
    requestIp = require('request-ip'),
    bodyparser = require('body-parser'),
    log = require('./log');

module.exports = function(app, config) {
    let env = config.env || 'dev';
    app.locals.ENV = env;
    app.locals.ENV_DEVELOPMENT = env == 'dev';

    /**
     * add middleware to add ip address to request.
     */
    app.use(requestIp.mw());

    /**
     * Create and configure our templating engine
     */
    require(config.root + '/app/nunjucks/nunjucks')(app, config);

    // app.use(favicon(config.root + '/public/img/favicon.ico')); //TODO serve all the icons here. No need to log these. Also take care of apple-icons, touch icons. tile-iscons etc

    /**
    * Log all requests. Including statics.
    */
    require(config.root + '/app/middleware/logging/logging.js').use(app);

    app.use(i18n.init);

    // Middleware to remove locale from url and set i18n.locale based on url. This allows one route to match different locales
    require(config.root + '/app/middleware/i18n/localeFromQuery.js').use(app, config.locales, config.defaultLocale);

    app.use(bodyparser.json({
        limit: '1mb'
    }));
    app.use(bodyparser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use(compress());
    app.use(express.static(config.root + '/public', {
        cacheControl: true,
        maxAge: '3d',
        etag: false
    }));
    app.use(methodOverride());
    app.use(passport.initialize());

    // add menu to all requests
    require(config.root + '/app/middleware/menu/menu.js').use(app);

    // app.use(slashes(false, { code: 302 }));//the module is defect. asking it to remove slashes leads to circular redirects
    app.use(function(req, res, next) {
        if (req.path.substr(-1) == '/' && req.path.length > 1) {
            let query = req.url.slice(req.path.length);
            res.redirect(302, res.locals.gb.locales.urlPrefix + req.path.slice(0, -1) + query);
        } else {
            next();
        }
    });

    // app.use(function (req, res, next) {
    //     req.log = log;
    //     req.log.trace({req: req}, "start");
    //     next();
    // });


    /**
     require all route controllers
     */
    let controllers = glob.sync(config.root + '/app/controllers/**/*.ctrl.js');
    controllers.forEach(function(controller) {
        require(controller)(app);
    });

    // require(config.root + '/app/urlHandling/urlHandling.js')(app); //disable all drupal route handling - as part of the development to move to contentful
    require(config.root + '/app/controllers/resource/key/resourceBySlugCtrl.js')(app);

    // add middleware to handle redirects of old urls or shortened menu items
    let redirects = require(config.root + '/app/middleware/redirects/redirects.js');
    app.use(redirects);

    // let apiRequestErrors = require(config.root + '/app/errors/apiRequestErrors.js');
    // app.use(apiRequestErrors);

    // add error and missing page routes
    require(config.root + '/app/errors/404.js')(app);
    require(config.root + '/app/errors/500.js')(app);

    process.on('unhandledRejection', function(reason, p) {
        log.error('Unhandled Rejection at root: Promise ', p, ' reason: ', reason);
        // There is not much else to do here. Keep track of the logs and make sure this never happens. There should be no unhandled rejections.
    });
    process.on('uncaughtException', function(err) {
        // eslint-disable-next-line no-console
        console.error('FATAL: Uncaught exception.');
        console.error(err.stack || err);
        setTimeout(function() {
            process.exit(1);
        }, 200);
        log.error('FATAL: Uncaught exception.');
        log.error(err.stack || err);
    });
};
