/**
 * An endpoint to serve historic weather reports. Used by the occurrence page as supplemental information and not crucial.
 */
var express = require('express'),
    request = require('request'),
    fs = require('fs'),
    gulp = require('gulp'),
    path = require('path'),
    config = rootRequire('config/build'),
    gulpif = require('gulp-if'),
    rename = require("gulp-rename"),
    wiredep = require('wiredep'),
    browserSync = require('browser-sync'),
    lost = require('lost'),
    axis = require('axis'),
    runSequence = require('run-sequence'),
    g = require('gulp-load-plugins')(),
    hash = require('object-hash'),
    router = express.Router();

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/css', function (req, res) {
    var body = req.body || {},
        hashed = hash(body);
    buildStylus(hashed);
    res.json({location: '/css/base/users/index-' + hashed + '.css'});
});

function buildStylus(hashed) {
    /**
     *  automatically import all stylus files in the main index.styl file
     *  Order is not guaranteed. This should be okay as there shouldn't be overlap between files.
     *  In case there is a need to have something imported before something else there is the option to name myname.first.styl
     */
    var injectFiles = gulp.src([
        path.join(config.paths.src, '/**/*.first.styl'),
        path.join(config.paths.src, '/**/*.second.styl'),
        path.join(config.paths.src, '/**/*.third.styl'),
        path.join(config.paths.src, '/**/*.styl'),
        path.join('!' + config.paths.src, '/shared/style/index.styl'),
        path.join('!' + config.paths.src, '/**/_*.styl')
    ], {
        read: false
    });

    var injectOptions = {
        transform: function (filePath) {
            filePath = filePath.replace(config.paths.src + '/', '');
            return '@import "' + path.join('../..', filePath) + '";';
        },
        starttag: '// injector',
        endtag: '// endinjector',
        addRootSlash: false
    };

    var processors = [
        lost()
    ];

    var dest = 'css/base';
    return gulp.src([
            path.join(config.paths.src, '/shared/style/index.styl')
        ])
        .pipe(g.replace('// userVariablesInjectHere', '$navBar_background = red'))
        .pipe(g.inject(injectFiles, injectOptions))
        .pipe(g.stylus({
            use: [axis()]
        })).on('error', config.errorHandler('Stylus'))
        .pipe(g.autoprefixer()).on('error', config.errorHandler('Autoprefixer'))
        .pipe(g.postcss(processors))
        .pipe(g.cleanCss())
        .pipe(rename(function (path) {
            path.basename += '-' + hashed;
        }))
        .pipe(gulp.dest(path.join(config.paths.dist, '/css/base/users/')));
}
