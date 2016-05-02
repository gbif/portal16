'use strict';

var gulp = require('gulp'),
    path = require('path'),
    yargs = require('yargs').argv,
    config = rootRequire('config/build'),
    g = require('gulp-load-plugins')();

gulp.task('env-constants', [], function() {
    var DATA_URL = yargs.dataapi || 'http://api.gbif.org/v1/',
        TILE_URL = yargs.tileapi || 'cdn.gbif.org/v1/map/density/tile.png';

    return gulp.src(config.envConstants.path)
        .pipe(g.replace('{{DATA_URL}}', DATA_URL))
        .pipe(g.replace('{{TILE_URL}}', TILE_URL))
        .pipe(g.rename(function (path) {
            path.extname = ".js"
        }))
        .pipe(gulp.dest(config.envConstants.dest));
});