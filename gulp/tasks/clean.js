'use strict';

var gulp = require('gulp'),
    del = require('del'),
    config = rootRequire('config/build');

gulp.task('clean-all', function () {
    return del(config.clean.all);
});