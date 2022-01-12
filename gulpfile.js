/* eslint-disable max-len */
/**
 *   Rather than manage one giant configuration file responsible
 *   for creating multiple tasks, each task has been broken out into
 *   its own file in gulp/tasks. Any files in that directory get
 *   automatically required below.
 *   To add a new task, simply add a new task file in the tasks directory.
 */
'use strict';

let gulp = require('gulp'),
    path = require('path'),
    config = require('./config/build'),
    runSequence = require('gulp4-run-sequence'),
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
    return runSequence(
        ['clean-all'],
        ['env-constants'],
        ['assets'],
        ['build:vendor'],
        ['vendorAssets'],
        ['vendor-styles'],
        ['stylus'],
        ['scripts'],
        ['dataRepo'],
        ['derivedDataset'],
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

gulp.task('test', gulp.series('test-client', 'test-server'));

gulp.task('watch', function () {
  gulp.watch([
    path.join(config.paths.src, '/**/*.styl'),
    path.join(config.paths.src, '/**/*.less'),
    path.join(config.paths.src, '/**/*.css')
  ], gulp.series('stylus-reload', 'ieStyle'));

  //, 'dataRepo', 'speciesLookup', 'dataValidator', 'ipt', 'observationTrends', 'home' //removed because they are slow to wait for. If you are developing this add again. Not ideal, but it seem to slow things down quite a bit
  gulp.watch(config.js.client.watch, gulp.series('scripts-reload', 'client-lint'));

  gulp.watch([path.join(config.paths.src, '/**/*.{html,nunjucks}')], gulp.series('templates'));
});

gulp.task('dev', function (callback) {
    runSequence(
        ['clean-all'],
        // ['revision'],
        ['env-constants'],
        ['build:vendor', 'stylus-reload', 'vendor-styles', 'scripts-reload', 'assets', 'vendorAssets', 'speciesLookup', 'nameParser', 'sequenceMatching', 'ipt', 'observationTrends', 'home', 'dataRepo', 'derivedDataset'],
        ['templates'],
        ['ieStyle'],
        ['watch'],
        callback);
});

gulp.task('default', gulp.task(config.buildType));
