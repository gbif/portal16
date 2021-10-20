'use strict';

let gulp = require('gulp'),
    yargs = require('yargs').argv,
    config = rootRequire('config/build'),
    g = require('gulp-load-plugins')(),
    COMMIT = yargs.commit || 'UNKNOWN';

/**
 * What is the github commit used for this build. this value is filled when building with Jenkins
 */
gulp.task('env-constants', function() {
    return gulp.src(config.envConstants.path)
        .pipe(g.replace('{{COMMIT}}', COMMIT))
        .pipe(g.rename(function(path) {
            path.extname = '.json';
        }))
        .pipe(gulp.dest(config.envConstants.dest));
});
