'use strict';

let gulp = require('gulp'),
    path = require('path'),
    KarmaServer = require('karma').Server,
    config = rootRequire('config/build'),
    SpecReporter = require('jasmine-spec-reporter'),
    reporters = require('jasmine-reporters'),
    jasmineServerConfig = rootRequire('spec/support/jasmine_server'),
    g = require('gulp-load-plugins')();

/**
 * Test server code
 */
gulp.task('test-server', function() {
    return gulp.src(jasmineServerConfig.spec_files)
        .pipe(g.jasmine({
            reporter: [new reporters.JUnitXmlReporter({
                savePath: './reports/'
            }), new SpecReporter()],
            errorOnFail: false
        }));

    // TODO Test if there are residues across runs (globals or such that would compromise tests)
});

gulp.task('test-server-continuously', gulp.series('test-server', function() {
    gulp.watch(config.js.server.paths, ['test-server']);
}));


/**
 * Run test once and exit
 */
gulp.task('test-client', function(done) {
    new KarmaServer({
        configFile: path.resolve('./karma.conf.js'),
        singleRun: true
    }, done).start();
});

/**
 * Run test and keep watching them
 */
gulp.task('test-client-continuously', function(done) {
    new KarmaServer({
        configFile: path.resolve('./karma.conf.js'),
        singleRun: false
    }, done).start();
});
