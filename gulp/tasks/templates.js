//Copy angular templates to build folder
'use strict';

var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    g = require('gulp-load-plugins')(),
    revReplace = require("gulp-rev-replace"),
    replace = require('gulp-replace'),
    revision = rootRequire('config/revision'),
    config = rootRequire('config/build');

gulp.task('templates', [], function () {
    return gulp.src('./app/views/**/*.{html,nunjucks}')
        .pipe(gulpif(config.isProd, revReplace({
            manifest: gulp.src(config.rev.manifest),
            replaceInExtensions: ['.html', '.nunjucks']
        })))
        .pipe(replace('/templates/', '/templates/' + revision.revision + '/'))
        .pipe(gulp.dest('./public/templates/' + revision.revision));
});
