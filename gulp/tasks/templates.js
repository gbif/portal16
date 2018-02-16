// Copy angular templates to build folder
'use strict';

let gulp = require('gulp'),
    replace = require('gulp-replace'),
    config = rootRequire('config/build');

gulp.task('templates', [], function() {
    return gulp.src('./app/views/**/*.html')
        .pipe(gulp.dest('./public/templates'));
});
