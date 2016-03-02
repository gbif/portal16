'use strict';

var gulp = require('gulp'),
    path = require('path'),
    config = rootRequire('config/build'),
    browserSync = require('browser-sync'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    transform = require('vinyl-transform'),
    browserify = require('browserify'),
    notifier = require('node-notifier'),
    g = require('gulp-load-plugins')();


gulp.task('scripts-reload', function() {
    return buildScripts()
        .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
    return buildScripts();
});

gulp.task('vendor-scripts', function() {
    return gulp.src(config.bower.jsFiles, {
            base: './'
        })
        .pipe(g.plumber())
        .pipe(g.sourcemaps.init())
        .pipe(g.concat('vendor.js'))
        .pipe(g.uglify())
        .pipe(g.sourcemaps.write('./'))
        .pipe(gulp.dest(path.join(config.paths.dist, 'js/vendor')));
});

function buildScripts() {
    return browserify({
            entries: config.js.browserify.path,
            debug: true
        }).bundle()
        .on('error', function (err) {
            console.log(err.toString());
            notifier.notify({
                'title': 'Browserify',
                'message': err.toString()
            });
            this.emit("end");
        })
        .pipe(source('custom.js'))
        .pipe(buffer())
        .pipe(g.sourcemaps.init({
            loadMaps: true
        }))
        // Add transformation tasks to the pipeline here.
        .pipe(g.ngAnnotate()) // To not break angular injection when minified
        .pipe(g.if(config.isProd, g.uglify(), g.util.noop()))
        .on('error', g.util.log)
        .pipe(g.sourcemaps.write('./'))
        .pipe(gulp.dest(path.join(config.paths.dist, 'js/base')));
}