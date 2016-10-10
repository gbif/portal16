//Copy angular templates to build folder
'use strict';

var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    g = require('gulp-load-plugins')(),
    revReplace = require("gulp-rev-replace"),
    config = rootRequire('config/build');

gulp.task('templates', [], function () {
    return gulp.src('./app/views/**/*.html')
        // .pipe(g.htmlmin({})) // options for mimification at https://github.com/kangax/html-minifier
        // .pipe(g.angularTemplatecache('templateCacheHtml.js', { //at some point the templates should probably go into the template cache and load along with the rest of the js
        // 	module: 'portal',
        // 	root: 'templates'
        // }))
        .pipe(gulpif(config.isProd, revReplace({
            manifest: gulp.src(config.rev.manifest),
            replaceInExtensions: ['.html']
        })))
        .pipe(gulp.dest('./public/templates'));
});

gulp.task('templates-nunjucks', [], function () {
    return gulp.src('./app/views/**/*.nunjucks')
        .pipe(gulpif(config.isProd, revReplace({
            manifest: gulp.src(config.rev.manifest),
            replaceInExtensions: ['.nunjucks']
        })))
        .pipe(gulp.dest('./build/nunjucks'));
});

