let express = require('express'),
    glob = require('glob'),
// favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    i18n = require("i18n"),
    requestIp = require('request-ip'),
    slashes = require("connect-slashes"),
    bodyparser = require('body-parser');
//log = rootRequire('config/log'),

module.exports = function (app, config) {
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

    ///**
    // * Log all requests. Including statics.
    // */
    //app.use(function (req, res, next) {
    //    log.info({req: req});
    //    next();
    //});


    let locales = ['en', 'da'],
        defaultLocale = 'en';

    i18n.configure({
        locales: locales,
        defaultLocale: defaultLocale,
        directory: './locales/server/',
        objectNotation: true,
        fallbacks: {'da': 'en'},
        updateFiles: false
    });
    app.use(i18n.init);

    //Middleware to remove locale from url and set i18n.locale based on url. This allows one route to match different locales
    require(config.root + '/app/middleware/i18n/localeFromQuery.js').use(app, locales, defaultLocale);

    // Node doesn't include other locales than english per default. Include these to use Intl.
    require(config.root + '/app/helpers/intlPolyfill.js').setSupportedLocales(locales);

    //add menu to all requests
    require(config.root + '/app/middleware/menu/menu.js').use(app);

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
        maxAge: '100d',
        etag: false
    }));
    app.use(methodOverride());

    app.use(slashes(false, { code: 302 }));
    /**
     require all route controllers
     */
    let controllers = glob.sync(config.root + '/app/controllers/**/*.ctrl.js');
    controllers.forEach(function (controller) {
        require(controller)(app);
    });

    require(config.root + '/app/urlHandling/urlHandling.js')(app);
    require(config.root + '/app/errors/404.js')(app);
    require(config.root + '/app/errors/500.js')(app);
};
