let express = require('express'),
    helmet = require('helmet'),
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

module.exports = function (app, config) {
    let env = config.env || 'dev';
    app.locals.ENV = env;
    app.locals.ENV_DEVELOPMENT = env == 'dev';
    // based on https://github.com/OWASP/CheatSheetSeries/issues/376 helmet disables browsers' buggy cross-site scripting filter
    if (env !== 'dev') {
        let helmetConfig = {
            referrerPolicy: false,
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: [
                        'maxcdn.bootstrapcdn.com',
                        'cdn.jsdelivr.net/codemirror.spell-checker/',
                        `'self'`,
                        `*.gbif.org`,
                        `*.gbif-uat.org`,
                        `*.gbif-lab.org`,
                        `*.gbif-dev.org`,
                        `*.gbif-staging.org`,
                        `*.${config.topDomain}`,
                        '*.google.com',
                        '*.google-analytics.com',
                        'plausible.io',
                        'fonts.gstatic.com',
                        'images.ctfassets.net',
                        'data:',
                        'api.mapbox.com',
                        '*.tiles.mapbox.com',
                        '*.vimeo.com',
                        'vimeo.com',
                        'eepurl.com',
                        'gbif.us18.list-manage.com',
                        'zenodo.org',
                        '*.youtube.com'
                    ],
                    scriptSrc: [
                        `'self'`,
                        `'unsafe-inline'`,
                        `'unsafe-eval'`,
                        `*.gbif.org`,
                        `*.gbif-uat.org`,
                        `*.gbif-dev.org`,
                        `*.gbif-lab.org`,
                        `*.gbif-staging.org`,
                        '*.google-analytics.com',
                        'plausible.io',
                        'api.mapbox.com',
                        'unpkg.com/react@17/umd/react.production.min.js',
                        'unpkg.com/react-dom@17/umd/react-dom.production.min.js'
                    ],
                    styleSrc: [
                        `'self'`,
                        `'unsafe-inline'`,
                        '*.googleapis.com',
                        'cdnjs.cloudflare.com/ajax/libs/mapbox-gl/*.css',
                        'api.mapbox.com',
                        'maxcdn.bootstrapcdn.com'],
                    mediaSrc: ['*'],
                    imgSrc: ['*', 'data:'],
                    workerSrc: [
                        'blob:'
                    ],
                    upgradeInsecureRequests: []
                    // frameAncestors: [ // This leads to conflicting statements in Helmet. Looks like we should either go with frameAncestors or x-frame-options
                    //   'https://www.onezoom.org'
                    // ]
                }

            },
            hsts: {
                maxAge: 600,
                includeSubDomains: true
            }
        };
        app.use(helmet(helmetConfig));
    }

    app.use(function (req, res, next) {
        if (req.get('host') === 'portal.gbif.org') {
            const header = res.get('Content-Security-Policy');
            if (typeof header === 'string') {
                res.set('Content-Security-Policy', header.replace(/upgrade-insecure-requests/g, ''));
            }
        }
        next();
    });

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
        etag: false,
        redirect: false
    }));
    // Middleware to set default Cache-Control header
    app.use((req, res, next) => {
        res.set('Cache-Control', 'public, max-age=600, must-revalidate'); // Default cache for 10 minutes
        next();
    });

    // Middleware to set shorter cache for responses with status code above 400
    app.use((req, res, next) => {
        const originalSend = res.send;
        res.send = function (body) {
            if (res.statusCode >= 400) {
                res.set('Cache-Control', 'public, max-age=60, must-revalidate'); // Short cache for 1 minute
            }
            originalSend.call(this, body);
        };
        next();
    });
    app.use(methodOverride());
    app.use(passport.initialize());

    // add menu to all requests
    require(config.root + '/app/middleware/menu/menu.js').use(app);

    // app.use(slashes(false, { code: 302 }));//the module is defect. asking it to remove slashes leads to circular redirects
    app.use(function (req, res, next) {
        if (req.path.substr(-1) == '/' && req.path.length > 1) {
            let query = req.url.slice(req.path.length);
            let redirectPath = res.locals.gb.locales.urlPrefix + req.path.slice(0, -1) + query;
            res.redirect(302, config.domain + redirectPath);
        } else {
            next();
        }
    });

    // app.use(function (req, res, next) {
    //     req.log = log;
    //     req.log.trace({req: req}, "start");
    //     next();
    // });
    let forwardToNewPortal = require(config.root + '/app/middleware/forwardToNewPortal/forward.js');

     app.use(forwardToNewPortal);

    /**
     require all route controllers
     */
    let controllers = glob.sync(config.root + '/app/controllers/**/*.ctrl.js');
    controllers.forEach(function (controller) {
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

    process.on('unhandledRejection', function (reason, p) {
        log.error('Unhandled Rejection at root: Promise ', p, ' reason: ', reason);
        // There is not much else to do here. Keep track of the logs and make sure this never happens. There should be no unhandled rejections.
    });
    process.on('uncaughtException', function (err) {
        // eslint-disable-next-line no-console
        console.error('FATAL: Uncaught exception.');
        console.error(err.stack || err);
        setTimeout(function () {
            process.exit(1);
        }, 200);
        log.error('FATAL: Uncaught exception.');
        log.error(err.stack || err);
    });
};
