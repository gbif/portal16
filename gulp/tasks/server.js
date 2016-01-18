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
    g = require('gulp-load-plugins')();

// gulp.task('server-lint', ['client-lint'], function() {
//     return gulp.src(config.js.server.paths)
//         .pipe(g.eslint())
//         .pipe(g.eslint.format())
//         .pipe(g.size())
// });

// gulp.task('client-lint', function() {
//     return gulp.src(config.js.client.paths)
//         .pipe(g.eslint())
//         .pipe(g.eslint.format())
//         .pipe(g.size())
// });

gulp.task('browser-sync', ['server'], function() {
    console.log('Starting browser-synced site at http://localhost:' + config.browsersync.port);
    return browserSync.init(null, {
        proxy: 'http://localhost:' + serverConfig.port,
        files: ['public/**/*.*'],
        browser: ['google chrome'],
        open: config.browsersync.autoOpenBrowsers,
        port: config.browsersync.port
    });
});

gulp.task('server', ['server-lint'], function(cb) {

    var started = false;

    return g.nodemon({
            script: 'app.js',
            ext: 'js nunjucks',
            ignore: ['app/views/'],
            tasks: ['server-lint'],
            watch: ['app.js', 'config/', 'app/'], //, 'app/views/**/*.nunjucks'
            env: {
                'NODE_ENV': 'development'
            },
            stdout: false
        })
        .on('readable', function() {
            this.stdout.on('data', function(chunk) {
                if (/^Express server listening on port/.test(chunk)) {
                    browserSync.reload();
                }
            });
            this.stdout.pipe(process.stdout);
            this.stderr.pipe(process.stderr);
        })
        .on('start', function() {
            // to avoid nodemon being started multiple times //TODO is this actulaly an issue? Someone wrote so, but I haven't observed it myself.
            if (!started) {
                started = true;
                cb();
            }
        });
});