//Copy angular templates to build folder
'use strict';

var gulp = require('gulp'),
    replace = require('gulp-replace'),
    config = rootRequire('config/build');

gulp.task('templates', [], function () {

    var revision = config.loadRevision();
    return gulp.src('./app/views/**/*.html')
        // .pipe(g.htmlmin({})) // options for mimification at https://github.com/kangax/html-minifier
        // .pipe(g.angularTemplatecache('templateCacheHtml.js', { //at some point the templates should probably go into the template cache and load along with the rest of the js
        // 	module: 'portal',
        // 	root: 'templates'
        // }))
        .pipe(gulp.dest('./public/templates'));
});
