var express = require('express'),
    glob = require('glob'),
// favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    bodyparser = require('body-parser');
    //log = rootRequire('config/log'),

module.exports = function (app, config) {
    var env = process.env.NODE_ENV || 'development';
    app.locals.ENV = env;
    app.locals.ENV_DEVELOPMENT = env == 'development';

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

    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());
    app.use(compress());
    app.use(express.static(config.root + '/public'));
    app.use(methodOverride());


    /**
     require all route controllers
     */
    var controllers = glob.sync(config.root + '/app/controllers/**/*.js');
    controllers.forEach(function (controller) {
        require(controller)(app);
    });

    require(config.root + '/app/errors/404.js')(app);
    require(config.root + '/app/errors/500.js')(app);
};
