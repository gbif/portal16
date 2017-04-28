'use strict';

var gulp = require('gulp'),
    rev = require('gulp-rev'),
    gulpif = require('gulp-if'),
    config = rootRequire('config/build');

gulp.task('assets', [], function () {
    return gulp.src(config.assets.paths)
        .pipe(gulp.dest(config.assets.dest));
});

gulp.task('vendorAssets', [], function () {
    return gulp.src(config.vendorAssets.paths)
        .pipe(gulp.dest(config.vendorAssets.dest));
});