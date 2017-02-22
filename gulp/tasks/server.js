/**
 It is only used in development mode and starts the server using `nodemon`.
 Nodemon watch files and restarts the server when files are changed.
 Which files in configurable in this task.
 */
'use strict';

var gulp = require('gulp'),
    serverConfig = rootRequire('config/config'),
    config = rootRequire('config/build'),
    browserSync = require('browser-sync'),
    yargs = require('yargs').argv,
    g = require('gulp-load-plugins')();

gulp.task('browser-sync', ['server'], function () {
    console.log('Starting browser-synced site at http://localhost:' + config.browsersync.port);
    return browserSync.init(null, {
        proxy: 'http://localhost:' + serverConfig.port,
        files: ['public/**/*.*'],
        browser: ['google chrome'],
        open: config.browsersync.autoOpenBrowsers,
        port: config.browsersync.port,
        ui: config.browsersync.ui
    });
});

gulp.task('server', ['server-lint'], function (cb) {

    var started = false;
    var args = [];
    ['loglevel', 'dataapi', 'tileapi', 'cmsapi', 'port', 'credentials', 'verification'].forEach(function (e) {
        if (yargs[e]) {
            args.push('--' + e + '=' + yargs[e]);
        }
    });

    return g.nodemon({
            script: 'app.js',
            args: args,
            ext: 'js nunjucks',
            ignore: ['app/views/'],
            tasks: ['server-lint'],
            watch: ['app.js', 'config/', 'app/'], //, 'app/views/**/*.nunjucks'
            env: {
                'NODE_ENV': serverConfig.env
            },
            stdout: false
        })
        .on('readable', function () {
            this.stdout.on('data', function (chunk) {
                if (/^Express server listening on port/.test(chunk)) {
                    browserSync.reload();
                }
            });
            this.stdout.pipe(process.stdout);
            this.stderr.pipe(process.stderr);
        })
        .on('start', function () {
            // to avoid nodemon being started multiple times //TODO is this actulaly an issue? Someone wrote so, but I haven't observed it myself.
            if (!started) {
                started = true;
                cb();
            }
        });
});