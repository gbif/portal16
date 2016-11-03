/**
 *   Rather than manage one giant configuration file responsible
 *   for creating multiple tasks, each task has been broken out into
 *   its own file in gulp/tasks. Any files in that directory get
 *   automatically required below.
 *   To add a new task, simply add a new task file in the tasks directory.
 */
'use strict';

var gulp = require('gulp'),
    path = require('path'),
    fs = require('fs'),
    config = require('./config/build'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    requireDir = require('require-dir');

global.rootRequire = function (name) {
    return require(__dirname + '/' + name);
};

/**
 * Write unique build revision to json file
 */
var revision = (Math.random().toString(36)+'0000000000').slice(2, 8+2);
fs.writeFileSync('./config/revision.json', '{"revision":"'+revision+'"}');

/**
 *  Require all tasks in gulp/tasks, including sub folders
 */
requireDir('./gulp/tasks', {
    recurse: true
});

/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
// gulp.task('default', ['clean'], function () {
//     gulp.start('build');
// });

gulp.task('prod', function (callback) {
    runSequence(
        ['clean-all'],
        ['env-constants'],
        // these produce rev'ed files
        // We avoid parallel tasks that could overwrite the rev-manifest.json
        ['assets'],
        ['vendor-styles'],
        ['vendor-scripts'],
        // styles & scripts need the rev'ed assets already but also produce new rev entries.
        ['stylus'],
        ['scripts'],
        ['speciesLookup'],
        ['dataValidator'],
        ['ipt'],
        ['templates'],
        ['ieStyle'],
        callback);
});

gulp.task('test-drive-development', [], function (callback) {
    runSequence(
        ['test-server-continuously', 'test-client-continuously', 'dev'],
        callback);
});//TODO add development task

gulp.task('test', ['test-client', 'test-server']);

gulp.task('watch', ['browser-sync'], function () {
    gulp.watch([
        path.join(config.paths.src, '/**/*.styl'),
        path.join(config.paths.src, '/**/*.less'),
        path.join(config.paths.src, '/**/*.css')
    ], ['styles-reload']);

    // gulp.watch([config.js.server.paths], ['server-lint']); //should not be necessary. the files are linted at start up
    gulp.watch([config.js.client.watch], ['scripts-reload', 'speciesLookup', 'dataValidator', 'ipt', 'client-lint']);

    gulp.watch([path.join(config.paths.src, '/**/*.{html,nunjucks}')], ['templates']).on('change', browserSync.reload);

    //browserSync.watch('app/views/**/*.nunjucks').on('change', browserSync.reload);
});

gulp.task('dev', [], function (callback) {
    runSequence(
        ['clean-all'],
        ['env-constants'],
        ['stylus-reload', 'vendor-styles', 'scripts-reload', 'vendor-scripts', 'assets', 'speciesLookup', 'dataValidator', 'ipt'],
        ['templates'],
        ['ieStyle'],
        ['watch'],
        callback);
});

gulp.task('default', [config.buildType]);
