'use strict';

var gulp = require('gulp'),
    config = rootRequire('config/build');

gulp.task('assets', [], function () {
    return gulp.src(config.assets.paths)
        .pipe(gulp.dest(config.assets.dest));
});
