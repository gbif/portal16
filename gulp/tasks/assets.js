'use strict';

let gulp = require('gulp'),
    g = require('gulp-load-plugins')(),
    config = rootRequire('config/build'),
    configEnv = rootRequire('config/config');

gulp.task('assets', [], function() {
    return gulp.src(config.assets.paths)
        .pipe(gulp.dest(config.assets.dest));
});

gulp.task('vendorAssets', [], function() {
    return gulp.src(config.vendorAssets.paths)
        .pipe(gulp.dest(config.vendorAssets.dest));
});
