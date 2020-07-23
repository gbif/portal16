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
    config = require('./config/build'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    requireDir = require('require-dir');

global.rootRequire = function (name) {
    return require(__dirname + '/' + name);
};

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
        ['assets'],
        ['build:vendor'],
        ['vendorAssets'],
        ['vendor-styles'],
        ['stylus'],
        ['scripts'],
        ['dataRepo'],
        ['speciesLookup'],
        ['nameParser'],
        ['sequenceMatching'],
        ['observationTrends'],
        ['home'],
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

    //gulp.watch([config.js.client.watch], ['scripts-reload'/*, 'client-lint'*/]); //, 'dataRepo', 'speciesLookup', 'dataValidator', 'ipt', 'observationTrends', 'home'//removed because they are slow to wait for. If you are developing this add again. Not ideal, but it seem to slow things down quite a bit

    gulp.watch([config.js.client.watch], ['client-lint', 'scripts-reload']).on('change', browserSync.reload);

    gulp.watch([path.join(config.paths.src, '/**/*.{html,nunjucks}')], ['templates']).on('change', browserSync.reload);

    //browserSync.watch('app/views/**/*.nunjucks').on('change', browserSync.reload);
});

gulp.task('dev', [], function (callback) {
    runSequence(
        ['clean-all'],
        // ['revision'],
        ['env-constants'],
        ['build:vendor', 'stylus-reload', 'vendor-styles', 'scripts-reload', 'assets', 'vendorAssets', 'speciesLookup', 'nameParser', 'sequenceMatching', 'ipt', 'observationTrends', 'home', 'dataRepo'],
        ['templates'],
        ['ieStyle'],
        ['watch'],
        callback);
});

gulp.task('default', [config.buildType]);