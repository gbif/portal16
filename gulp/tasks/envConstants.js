'use strict';

var gulp = require('gulp'),
    path = require('path'),
    yargs = require('yargs').argv,
    config = rootRequire('config/build'),
    configEnv = rootRequire('config/config'),
    g = require('gulp-load-plugins')();

gulp.task('env-constants', [], function () {
    var DATA_URL = configEnv.dataApi,
        TILE_URL = configEnv.tileApi,
        CMS_URL = configEnv.cmsApi;

    return gulp.src(config.envConstants.path)
        .pipe(g.replace('{{DATA_URL}}', DATA_URL))
        .pipe(g.replace('{{TILE_URL}}', TILE_URL))
        .pipe(g.replace('{{CMS_URL}}', CMS_URL))
        .pipe(g.rename(function (path) {
            path.extname = ".js"
        }))
        .pipe(gulp.dest(config.envConstants.dest));
});