// Copy angular templates to build folder
'use strict';

let gulp = require('gulp');

gulp.task('templates', function() {
    return gulp.src('./app/views/**/*.html')
        .pipe(gulp.dest('./public/templates'));
});
