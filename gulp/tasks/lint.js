'use strict';

var gulp = require('gulp'),
    config = rootRequire('config/build'),
    g = require('gulp-load-plugins')();

gulp.task('server-lint', ['client-lint'], function() {
    return gulp.src(config.js.server.paths)
        .pipe(g.eslint())
        .pipe(g.eslint.format())
        .pipe(g.size())
});

gulp.task('client-lint', function() {
    return gulp.src(config.js.client.paths)
        .pipe(g.eslint())
        .pipe(g.eslint.format())
        .pipe(g.size())
});