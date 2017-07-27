'use strict';

var gulp = require('gulp'),
    path = require('path'),
    yargs = require('yargs').argv,
    config = rootRequire('config/build'),
    configEnv = rootRequire('config/config'),
    g = require('gulp-load-plugins')();

gulp.task('env-constants', [], function () {
    var DATA_URL_V2 = configEnv.dataApiV2,
        DATA_URL = configEnv.dataApi,
        TILE_URL = configEnv.tileApi,
        CMS_URL = configEnv.cmsApi,
        ANALYTICS_IMG = configEnv.analyticsImg;

    return gulp.src(config.envConstants.path)
        .pipe(g.replace('{{DATA_URL_V2}}', DATA_URL_V2))
        .pipe(g.replace('{{DATA_URL}}', DATA_URL))
        .pipe(g.replace('{{TILE_URL}}', TILE_URL))
        .pipe(g.replace('{{CMS_URL}}', CMS_URL))
        .pipe(g.replace('{{PUBLIC_CONSTANT_KEYS}}', JSON.stringify(configEnv.publicConstantKeys, null, 2)))
        .pipe(g.replace('{{ANALYTICS_IMG}}', ANALYTICS_IMG))
        .pipe(g.rename(function (path) {
            path.extname = ".json"
        }))
        .pipe(gulp.dest(config.envConstants.dest));
});
