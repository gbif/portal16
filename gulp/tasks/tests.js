'use strict';

var gulp = require('gulp'),
    path = require('path'),
    KarmaServer = require('karma').Server,
    config = rootRequire('config/build'),
    reporters = require('jasmine-reporters'),
    g = require('gulp-load-plugins')();

/**
 * Test server code
 */
gulp.task("test-server", function() {
    return gulp.src(config.js.server.testPaths)
        .pipe(g.jasmine({
            reporter: [new reporters.JUnitXmlReporter( {
                savePath: './reports/'
            }), new reporters.TapReporter()]
        }));

    //TODO This is currently not rerunnable. It fails hard and don't run in its own process.
    //So variables may live across runs
    //gulp-spawn-mocha might remedy this
});


/**
 * Run test once and exit
 */
gulp.task('test-client', function (done) {
    new KarmaServer({
        configFile: path.resolve('./karma.conf.js'),
        singleRun: true
    }, done).start();
});

/**
 * Run test and keep watching them
 */
gulp.task('test-client-continuously', function (done) {
    new KarmaServer({
        configFile: path.resolve('./karma.conf.js'),
        singleRun: false
    }, done).start();
});