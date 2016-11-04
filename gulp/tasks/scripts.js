'use strict';

var gulp = require('gulp'),
    path = require('path'),
    config = rootRequire('config/build'),
    browserSync = require('browser-sync'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    transform = require('vinyl-transform'),
    browserify = require('browserify'),
    rename = require("gulp-rename"),
    rev = require('gulp-rev'),
    revReplace = require("gulp-rev-replace"),
    replace = require('gulp-replace'),
    fs = require('fs'),
    gulpif = require('gulp-if'),
    notifier = require('node-notifier'),
    g = require('gulp-load-plugins')();

gulp.task('scripts-reload', function () {
    return buildScripts()
        .pipe(browserSync.stream());
});

gulp.task('scripts', function () {
    return buildScripts();
});

gulp.task('vendor-scripts', function () {
    var vendor = 'js/vendor';
    return gulp.src(config.bower.jsFiles, {
            base: './'
        })
        .pipe(g.plumber())
        .pipe(gulpif(!config.isProd, g.sourcemaps.init()))
        .pipe(g.concat('vendor.js'))
        .pipe(g.if(config.isProd, g.uglify(), g.util.noop()))
        .pipe(gulpif(config.isProd, rev()))
        .pipe(gulpif(!config.isProd, g.sourcemaps.write('./')))
        .pipe(gulp.dest(path.join(config.paths.dist, vendor)))
        .pipe(rename(function (path) {
            path.dirname += "/" + vendor
        }))
        .pipe(gulpif(config.isProd, rev.manifest({
            path: config.rev.manifest,
            cwd: config.rev.manifestDest,
            merge: true
        })))
        .pipe(gulpif(config.isProd, gulp.dest(config.rev.manifestDest)));
});

function buildScripts() {
    return build(config.js.browserify.main.path, config.js.browserify.main.dest);
}

gulp.task('speciesLookup', function () {
    return build('./app/views/pages/tools/speciesLookup/speciesLookup.entry.js', 'pages/speciesLookup.js');
});
gulp.task('dataValidator', function () {
    return build('./app/views/pages/tools/dataValidator/dataValidator.entry.js', 'pages/dataValidator.js');
});
gulp.task('ipt', function () {
    return build('./app/views/pages/ipt/ipt.entry.js', 'pages/ipt.js');
});

//gulp.task('buildOccurrenceKey', function() {
//    return build(config.js.browserify.occurrenceKey.path, config.js.browserify.occurrenceKey.dest)
//        .pipe(browserSync.stream());
//});

function build(entry, name) {
    var revision = config.loadRevision();
    var dest = 'js/base';
    return browserify({
        entries: entry,
        debug: true
    }).bundle()
        .on('error', function (err) {
            if (!config.isProd) {
                console.log(err.toString());
                notifier.notify({
                    'title': 'Browserify',
                    'message': err.toString()
                });
            } else {
                throw err;
            }
            this.emit("end");
        })
        .pipe(source(name))
        .pipe(buffer())
        .pipe(gulpif(!config.isProd, g.sourcemaps.init({
            loadMaps: true
        })))
        // Add transformation tasks to the pipeline here.
        .pipe(g.ngAnnotate()) // To not break angular injection when minified
        .pipe(g.if(config.isProd, g.uglify(), g.util.noop()))
        .on('error', g.util.log)
        .pipe(gulpif(!config.isProd, g.sourcemaps.write('./')))
        .pipe(gulpif(config.isProd, revReplace({
            manifest: gulp.src(config.rev.manifest)
        })))
        .pipe(gulpif(config.isProd, rev()))
        .pipe(replace('/templates/', '/templates/' + revision + '/'))
        .pipe(gulp.dest(path.join(config.paths.dist, dest)))
        .pipe(rename(function (path) {
            path.dirname = "/" + dest + (path.dirname == "." ? "" : "/" + path.dirname);
        }))
        .pipe(gulpif(config.isProd, rev.manifest({
            path: config.rev.manifest,
            cwd: config.rev.manifestDest,
            merge: true
        })))
        .pipe(gulpif(config.isProd, gulp.dest(config.rev.manifestDest)));
}
